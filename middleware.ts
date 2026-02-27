import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import acceptLanguage from 'accept-language';

acceptLanguage.languages(['en', 'pt']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === i18n: detect and set language cookie ===
  let lang = request.cookies.get('NEXT_LOCALE')?.value;
  if (!lang) {
    lang = acceptLanguage.get(request.headers.get('Accept-Language')) || 'en';
  }

  // === Auth: protect dashboard routes ===
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isDashboard = pathname.startsWith('/dashboard');

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect unauthenticated users away from dashboard
  if (isDashboard && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const response = NextResponse.next();
  response.cookies.set('NEXT_LOCALE', lang);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
};
