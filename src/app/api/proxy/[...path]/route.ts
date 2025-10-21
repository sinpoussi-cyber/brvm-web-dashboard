import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_BACKEND_URL = 'https://brvm-api-xode.onrender.com';
const DEFAULT_API_VERSION = '/api/v1';

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');
const normalizeVersion = (version: string) => (version.startsWith('/') ? version : `/${version}`);

const getBackendBaseUrl = () =>
  normalizeBaseUrl(
    process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL
  );
const getApiVersion = () => normalizeVersion(process.env.NEXT_PUBLIC_API_VERSION || DEFAULT_API_VERSION);
const getApiAuthHeaderName = () => process.env.API_AUTH_HEADER || 'Authorization';
const getApiAuthToken = () => process.env.API_AUTH_TOKEN;

async function proxyRequest(request: NextRequest, pathSegments?: string[]) {
  const segments = pathSegments?.filter(Boolean) ?? [];
  const targetPath = segments.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const backendBaseUrl = getBackendBaseUrl();
  const apiVersion = getApiVersion();
  const targetUrl = `${backendBaseUrl}${apiVersion}${
    targetPath ? `/${targetPath}` : ''
  }${searchParams ? `?${searchParams}` : ''}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');
  headers.set('accept-encoding', 'identity');

  const apiAuthToken = getApiAuthToken();
  const apiAuthHeader = getApiAuthHeaderName();

  if (apiAuthToken && !headers.has(apiAuthHeader)) {
    headers.set(apiAuthHeader, apiAuthToken);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
    cache: 'no-store',
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    const bodyBuffer = await request.arrayBuffer();
    init.body = bodyBuffer;
  }

  try {
    const backendResponse = await fetch(targetUrl, init);
    const responseHeaders = new Headers(backendResponse.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.set('access-control-allow-origin', '*');
    responseHeaders.set('cache-control', 'no-store');

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[proxy] Failed to forward request', error);
    return NextResponse.json(
      { detail: "Impossible de contacter l'API distante." },
      { status: 502 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest, context: { params: { path?: string[] } }) {
  return proxyRequest(request, context.params.path);
}

export async function HEAD(request: NextRequest, context: { params: { path?: string[] } }) {
  return proxyRequest(request, context.params.path);
}

export async function POST(request: NextRequest, context: { params: { path?: string[] } }) {
  return proxyRequest(request, context.params.path);
}

export async function PUT(request: NextRequest, context: { params: { path?: string[] } }) {
  return proxyRequest(request, context.params.path);
}

export async function PATCH(request: NextRequest, context: { params: { path?: string[] } }) {
  return proxyRequest(request, context.params.path);
}

export async function DELETE(request: NextRequest, context: { params: { path?: string[] } }) {
  return proxyRequest(request, context.params.path);
}

export async function OPTIONS(request: NextRequest, context: { params: { path?: string[] } }) {
  return proxyRequest(request, context.params.path);
}
