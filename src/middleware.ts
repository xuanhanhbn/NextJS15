import type { NextRequest } from 'next/server';
import arcjet from '@/libs/Arcjet';
import { detectBot } from '@arcjet/next';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing } from './libs/i18nNavigation';

const intlMiddleware = createMiddleware(routing);

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    allow: [
      'CATEGORY:SEARCH_ENGINE',
      'CATEGORY:PREVIEW',
      'CATEGORY:MONITOR',
    ],
  }),
);

// Auth configuration
export const config = {
  matcher: [
    // NextAuth.js auth pages
    '/api/auth/:path*',
    // Protected routes
    '/dashboard/:path*',
    // i18n routes
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};

// Middleware function
export default async function middleware(request: NextRequest) {
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        throw new Error('No bots allowed');
      }
      throw new Error('Access denied');
    }
  }

  // Allow direct access to sitemap.xml and robots.txt without i18n middleware processing
  if (request.nextUrl.pathname === '/sitemap.xml' || request.nextUrl.pathname === '/robots.txt') {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}
