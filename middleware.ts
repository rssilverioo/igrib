import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import acceptLanguage from 'accept-language';

acceptLanguage.languages(['en', 'pt']);

export function middleware(request: NextRequest) {
  let lang;
  
  // Check language from cookie
  if (request.cookies.has('NEXT_LOCALE')) {
    lang = request.cookies.get('NEXT_LOCALE')?.value;
  }
  
  // If no cookie, check Accept-Language header
  if (!lang) {
    lang = acceptLanguage.get(request.headers.get('Accept-Language'));
  }
  
  // Fallback to default language
  if (!lang) {
    lang = 'en';
  }

  // Update/set the NEXT_LOCALE cookie
  const response = NextResponse.next();
  response.cookies.set('NEXT_LOCALE', lang);

  return response;
}

export const config = {
  matcher: '/:path*'
};