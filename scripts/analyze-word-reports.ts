import { createClient } from '@supabase/supabase-js';
import mammoth from 'mammoth';
import fetch from 'node-fetch';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadLatestReport() {
  console.log('📥 Téléchargement du dernier rapport...');
  
  // URL du fichier Word depuis GitHub
  const githubUrl = 'https://raw.githubusercontent.com/sinpoussi-cyber/brvm-analysis-suite/main/reports/latest_report.docx';
  
  try {
    const response = await fetch(githubUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    console.log('✅ Rapport téléchargé avec succès');
    return buffer;
  } catch (error) {
    console.error('❌ Erreur téléchargement:', error);
    throw error;
  }
}

async function extractTextFromWord(buffer: ArrayBuffer) {
  console.log('📄 Extraction du texte du document Word...');
  
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    console.log(`✅ Texte extrait: ${result.value.length} caractères`);
    return result.value;
  } catch (error) {
    console.error('❌ Erreur extraction texte:', error);
    throw error;
  }
}

async function analyzeReportWithAI(text: string) {
  console.log('🤖 Analyse du rapport avec Claude AI...');
  
  const prompt = `Analyse ce rapport d'analyse boursière de la BRVM et extrais les informations suivantes:

1. Les 10 meilleures actions à ACHETER immédiatement avec leurs symboles boursiers et raisons
2. Les 10 actions à VENDRE ou ÉVITER avec leurs symboles boursiers et raisons
3. Pour chaque action mentionnée dans le rapport, donne une recommandation claire (Acheter/Vendre/Conserver)

IMPORTANT:
- Utilise UNIQUEMENT les symboles boursiers exacts mentionnés dans le rapport (ex: TTRC, SNTS, SGBC, etc.)
- Si une société n'a pas de symbole clair, ne l'inclus pas
- Base tes recommandations sur les analyses techniques et fondamentales du rapport
- Sois spécifique dans les raisons

Rapport:
${text}

Format ta réponse EXACTEMENT en JSON comme suit (sans aucun texte avant ou après):
{
  "top_buy": [
    {"symbol": "TTRC", "reason": "raison détaillée", "priority": 1}
  ],
  "top_sell": [
    {"symbol": "XXXX", "reason": "raison détaillée", "priority": 1}
  ],
  "all_recommendations": [
    {"symbol": "TTRC", "recommendation": "Acheter", "reason": "raison"}
  ]
}`;
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error! status: ${response.status}`);
    }
    
    const data: any = await response.json();
    const analysisText = data.content[0].text;
    
    console.log('📊 Réponse de l\'IA reçue');
    
    // Parser le JSON de la réponse
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      console.log(`✅ Analyse parsée: ${analysis.all_recommendations.length} recommandations`);
      return analysis;
    }
    
    throw new Error('Format de réponse invalide');
  } catch (error) {
    console.error('❌ Erreur analyse IA:', error);
    throw error;
  }
}

async function saveRecommendations(analysis: any) {
  console.log('💾 Sauvegarde des recommandations dans la base de données...');
  
  try {
    // Supprimer les anciennes recommandations
    const { error: deleteError } = await supabase
      .from('recommendations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.warn('⚠️ Erreur suppression anciennes recommandations:', deleteError);
    }
    
    // Insérer les nouvelles recommandations
    const recommendations = analysis.all_recommendations.map((rec: any) => ({
      symbol: rec.symbol,
      recommendation: rec.recommendation,
      source: 'IA Analysis - Rapport Quotidien',
      updated_at: new Date().toISOString()
    }));
    
    const { error: insertError } = await supabase
      .from('recommendations')
      .insert(recommendations);
    
    if (insertError) {
      console.error('❌ Erreur insertion recommandations:', insertError);
      throw insertError;
    }
    
    console.log(`✅ ${recommendations.length} recommandations sauvegardées`);
    
    // Afficher un résumé
    const buyCount = recommendations.filter((r: any) => 
      r.recommendation.toLowerCase().includes('achat') || r.recommendation.toLowerCase().includes('acheter')
    ).length;
    const sellCount = recommendations.filter((r: any) => 
      r.recommendation.toLowerCase().includes('vente') || r.recommendation.toLowerCase().includes('vendre')
    ).length;
    const holdCount = recommendations.length - buyCount - sellCount;
    
    console.log(`📊 Résumé: ${buyCount} achats, ${sellCount} ventes, ${holdCount} conserver`);
    
  } catch (error) {
    console.error('❌ Erreur sauvegarde:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Démarrage de l\'analyse des rapports BRVM...');
  console.log('⏰ Date:', new Date().toLocaleString('fr-FR'));
  console.log('');
  
  try {
    const reportBuffer = await downloadLatestReport();
    const text = await extractTextFromWord(reportBuffer);
    const analysis = await analyzeReportWithAI(text);
    await saveRecommendations(analysis);
    
    console.log('');
    console.log('✨ Analyse terminée avec succès!');
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('💥 Erreur fatale:', error);
    console.error('');
    process.exit(1);
  }
}

main();
