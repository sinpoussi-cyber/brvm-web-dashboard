'use server';

import { Buffer } from 'node:buffer';
import { inflateRawSync } from 'node:zlib';

import { supabase } from '@/lib/supabaseClient';
import type {
  RecommendationDocAction,
  RecommendationPayload,
  RecommendationRecord,
} from '@/types/recommendations';

const GITHUB_REPO = process.env.BRVM_RECO_REPO?.trim() || 'sinpoussi-cyber/brvm-analysis-suite';
const DOC_PATH_HINT = process.env.BRVM_RECO_DOC_PATH?.trim();
const GITHUB_HEADERS: Record<string, string> = {
  'User-Agent': 'brvm-dashboard-bot',
  Accept: 'application/vnd.github+json',
};

let cachedPayload: { timestamp: number; payload: RecommendationPayload } | null = null;
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

function normalizeForMatch(value: string | null | undefined) {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9 ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

async function fetchCompanies() {
  const { data } = await supabase
    .from('companies')
    .select('id, symbol, name, sector');
  return (data ?? []).map((row) => ({
    id: Number(row.id),
    symbol: String(row.symbol ?? '').toUpperCase(),
    name: row.name ?? undefined,
    sector: row.sector ?? undefined,
  }));
}

type TreeEntry = { path: string; type: string };

type GitHubTreeResponse = { tree?: TreeEntry[] };

type DocEntry = {
  symbol: string;
  action: RecommendationDocAction;
  comment?: string;
  rank?: number;
};

async function fetchGitHubTree(): Promise<TreeEntry[]> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/git/trees/HEAD?recursive=1`;
  const res = await fetch(url, { headers: GITHUB_HEADERS });
  if (!res.ok) {
    throw new Error(`Impossible de récupérer la liste des fichiers GitHub (${res.status})`);
  }
  const payload = (await res.json()) as GitHubTreeResponse;
  return payload.tree ?? [];
}

function detectDateFromPath(path: string) {
  const isoMatch = path.match(/(20\d{2})[-_](\d{2})[-_](\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }
  const compactMatch = path.match(/(20\d{2})(\d{2})(\d{2})/);
  if (compactMatch) {
    return `${compactMatch[1]}-${compactMatch[2]}-${compactMatch[3]}`;
  }
  return undefined;
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractDocumentXml(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  let eocdOffset = -1;
  for (let i = bytes.length - 22; i >= 0; i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error("Fichier DOCX invalide — fin d'archive introuvable");
  }
  const centralDirOffset = view.getUint32(eocdOffset + 16, true);
  let offset = centralDirOffset;
  const decoder = new TextDecoder();
  while (offset < bytes.length) {
    const signature = view.getUint32(offset, true);
    if (signature !== 0x02014b50) break;
    const compression = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const fileNameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const nameStart = offset + 46;
    const fileName = decoder.decode(bytes.slice(nameStart, nameStart + fileNameLength));
    if (fileName === 'word/document.xml') {
      const localHeader = new DataView(buffer, localHeaderOffset);
      const localNameLength = localHeader.getUint16(26, true);
      const localExtraLength = localHeader.getUint16(28, true);
      const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
      let compSize = compressedSize;
      if (!compSize) {
        let nextOffset = dataStart;
        while (nextOffset < bytes.length - 4) {
          if (view.getUint32(nextOffset, true) === 0x04034b50) break;
          nextOffset += 1;
        }
        compSize = Math.max(0, nextOffset - dataStart);
      }
      const slice = bytes.slice(dataStart, dataStart + compSize);
      let xmlBytes: Uint8Array;
      if (compression === 0) {
        xmlBytes = slice;
      } else if (compression === 8) {
        xmlBytes = new Uint8Array(inflateRawSync(Buffer.from(slice)));
      } else {
        throw new Error(`Compression ZIP non gérée (${compression})`);
      }
      return decoder.decode(xmlBytes);
    }
    offset = nameStart + fileNameLength + extraLength + commentLength;
  }
  throw new Error('word/document.xml introuvable dans le DOCX');
}

function docxToPlainText(buffer: ArrayBuffer) {
  const xml = extractDocumentXml(buffer);
  const paragraphs = xml.split(/<\/w:p>/);
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const texts = [...paragraph.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)].map((match) => decodeXmlEntities(match[1] ?? ''));
    const content = texts.join(' ').replace(/\s+/g, ' ').trim();
    if (content) lines.push(content);
  }
  return lines.join('\n');
}

function buildSymbolIndex(companies: Awaited<ReturnType<typeof fetchCompanies>>) {
  const variants: Array<{ token: string; symbol: string }> = [];
  for (const company of companies) {
    if (!company.symbol) continue;
    const candidateTokens = new Set<string>();
    candidateTokens.add(company.symbol);
    if (company.symbol.length > 2) {
      candidateTokens.add(`${company.symbol.slice(0, -2)} ${company.symbol.slice(-2)}`);
    }
    if (company.symbol.length > 3) {
      candidateTokens.add(`${company.symbol.slice(0, -3)} ${company.symbol.slice(-3)}`);
    }
    if (company.name) {
      candidateTokens.add(company.name);
    }
    for (const token of candidateTokens) {
      const normalized = normalizeForMatch(token);
      if (normalized) {
        variants.push({ token: normalized, symbol: company.symbol });
      }
    }
  }
  variants.sort((a, b) => b.token.length - a.token.length);
  return variants;
}

function parseDocEntries(
  text: string,
  companies: Awaited<ReturnType<typeof fetchCompanies>>
): { entries: DocEntry[]; title?: string; detectedDate?: string } {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let current: RecommendationDocAction = 'watch';
  let rank = 0;
  const entries: DocEntry[] = [];
  const variants = buildSymbolIndex(companies);

  for (const rawLine of lines) {
    const upper = normalizeForMatch(rawLine);
    if (/TOP\s*10\s*[-—–]?\s*ACTIONS?\s+À\s+ACHETER/i.test(rawLine)) {
      current = 'buy';
      rank = 0;
      continue;
    }
    if (/TOP\s*10\s*[-—–]?\s*ACTIONS?\s+À\s+VENDRE/i.test(rawLine)) {
      current = 'sell';
      rank = 0;
      continue;
    }
    if (/ACTIONS?\s+À\s+ÉVITER|ÉVITER\s+ABSOLUMENT/i.test(rawLine)) {
      current = 'avoid';
      rank = 0;
      continue;
    }
    if (/LISTE\s+COMPLÈTE/i.test(rawLine)) {
      current = 'watch';
      rank = 0;
      continue;
    }

    let symbol: string | undefined;
    for (const variant of variants) {
      if (upper.includes(variant.token)) {
        symbol = variant.symbol;
        break;
      }
    }
    if (!symbol) continue;
    rank += 1;
    entries.push({ symbol, action: current, comment: rawLine, rank: current === 'watch' ? undefined : rank });
  }

  const detectedDate = (() => {
    for (const line of lines) {
      const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
      if (dateMatch) {
        const parts = dateMatch[1].replace(/\./g, '/').replace(/-/g, '/').split('/');
        if (parts.length === 3) {
          const [d, m, y] = parts.map((part) => part.padStart(2, '0'));
          const year = y.length === 2 ? `20${y}` : y;
          return `${year}-${m}-${d}`;
        }
      }
    }
    return undefined;
  })();

  return { entries, title: lines[0], detectedDate };
}

async function fetchRecommendationDocument(companies: Awaited<ReturnType<typeof fetchCompanies>>) {
  try {
    const tree = await fetchGitHubTree();
    const docCandidates = tree
      .filter((entry) => entry.type === 'blob' && entry.path.toLowerCase().endsWith('.docx'))
      .filter((entry) => {
        if (!DOC_PATH_HINT) return true;
        return entry.path.includes(DOC_PATH_HINT);
      });
    if (!docCandidates.length) return null;

    const scored = docCandidates
      .map((entry) => ({
        entry,
        score: Date.parse(detectDateFromPath(entry.path) ?? '') || 0,
      }))
      .sort((a, b) => b.score - a.score);

    const target = scored[0]?.entry ?? docCandidates[0];
    if (!target) return null;

    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/HEAD/${encodeURIComponent(target.path).replace(/%2F/g, '/')}`;
    const res = await fetch(rawUrl, { headers: { 'User-Agent': GITHUB_HEADERS['User-Agent'] } });
    if (!res.ok) {
      throw new Error(`Impossible de télécharger le rapport (${res.status})`);
    }
    const buffer = await res.arrayBuffer();
    const text = docxToPlainText(buffer);
    const parsed = parseDocEntries(text, companies);
    const detectedDate = parsed.detectedDate ?? detectDateFromPath(target.path);
    return {
      entries: parsed.entries,
      sourceUrl: rawUrl,
      title: parsed.title,
      generatedAt: detectedDate,
    };
  } catch (error) {
    console.error('Analyse du rapport Word impossible :', error);
    return null;
  }
}

function mergeSupabaseData(
  companies: Awaited<ReturnType<typeof fetchCompanies>>,
  recs: any[] | null,
  summaries: any[] | null
) {
  const companyMap = new Map<string, { name?: string; sector?: string }>();
  for (const company of companies) {
    companyMap.set(company.symbol, { name: company.name, sector: company.sector });
  }

  const summaryMap = new Map<string, any>();
  summaries?.forEach((row) => {
    if (!row?.symbol) return;
    summaryMap.set(String(row.symbol).toUpperCase(), row);
  });

  const map = new Map<string, RecommendationRecord>();
  recs?.forEach((row) => {
    const symbol = String(row.symbol ?? '').toUpperCase();
    if (!symbol) return;
    const company = companyMap.get(symbol);
    const record: RecommendationRecord = {
      symbol,
      company_name: row.company_name ?? company?.name,
      sector: company?.sector ?? summaryMap.get(symbol)?.sector ?? undefined,
      last_close: row.last_close ?? undefined,
      variation_pred: row.variation_pred ?? undefined,
      rsi: row.rsi ?? undefined,
      macd: row.macd ?? undefined,
      recommendation: row.recommendation ?? summaryMap.get(symbol)?.recommendation ?? undefined,
      overall_signal: summaryMap.get(symbol)?.recommendation ?? undefined,
    };
    map.set(symbol, record);
  });

  return { map, companyMap };
}

export async function buildRecommendationsDataset(): Promise<RecommendationPayload> {
  if (cachedPayload && Date.now() - cachedPayload.timestamp < CACHE_TTL) {
    return cachedPayload.payload;
  }

  const companies = await fetchCompanies();
  const [docData, recsResponse, summariesResponse] = await Promise.all([
    fetchRecommendationDocument(companies),
    supabase
      .from('recommendations')
      .select('symbol, company_name, last_close, variation_pred, rsi, macd, recommendation, updated_at'),
    supabase
      .from('recommendations_summary')
      .select('symbol, sector, recommendation, updated_at'),
  ]);

  const recs = recsResponse.data ?? [];
  const summaries = summariesResponse.data ?? [];
  const { map, companyMap } = mergeSupabaseData(companies, recs, summaries);

  if (docData?.entries?.length) {
    docData.entries.forEach((entry) => {
      const symbol = entry.symbol.toUpperCase();
      const existing = map.get(symbol) ?? {
        symbol,
        company_name: companyMap.get(symbol)?.name,
        sector: companyMap.get(symbol)?.sector,
      };
      existing.doc_action = entry.action;
      existing.doc_comment = entry.comment;
      existing.doc_rank = entry.rank;
      map.set(symbol, existing);
    });
  }

  const items = Array.from(map.values()).sort((a, b) => {
    const rankA = a.doc_rank ?? Number.MAX_SAFE_INTEGER;
    const rankB = b.doc_rank ?? Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) return rankA - rankB;
    return a.symbol.localeCompare(b.symbol);
  });

  const payload: RecommendationPayload = {
    items,
    metadata: {
      fetched_at: new Date().toISOString(),
      source: docData?.sourceUrl,
      doc_title: docData?.title,
      doc_updated_at: docData?.generatedAt ?? undefined,
      buy_count: docData?.entries?.filter((entry) => entry.action === 'buy').length ?? 0,
      sell_count: docData?.entries?.filter((entry) => entry.action === 'sell').length ?? 0,
    },
  };

  cachedPayload = { timestamp: Date.now(), payload };
  return payload;
}
