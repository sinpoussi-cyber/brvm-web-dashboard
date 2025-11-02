import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const publicPaths = ['/', '/auth/register', '/auth/login', '/payment', '/education', '/contact'];
  const path = req.nextUrl.pathname;

  // Si la page est publique → accès libre
  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Vérifie la présence du cookie "brvm_token"
  const token = req.cookies.get('brvm_token')?.value;

  if (!token) {
    // Redirige vers login
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)', // toutes les routes sauf assets
  ],
};
