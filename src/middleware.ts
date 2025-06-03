import type { NextFetchEvent, NextRequest } from 'next/server';
import { detectBot } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import arcjet from '@/libs/Arcjet';
import { routing } from './libs/i18nRouting';

const handleI18nRouting = createMiddleware(routing);

const isAuthPage = createRouteMatcher([
  '/sign-in(.*)',
  '/:locale/sign-in(.*)',
  '/sign-up(.*)',
  '/:locale/sign-up(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/about(.*)',
  '/:locale/about(.*)',
]);

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE', // Allow search engines
      'CATEGORY:PREVIEW', // Allow preview links to show OG images
      'CATEGORY:MONITOR', // Allow uptime monitoring services
    ],
  }),
);

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // Verify the request with Arcjet
  // Use `process.env` instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return clerkMiddleware(async (auth, req) => {
    const pathname = req.nextUrl.pathname;
    const locale = pathname.match(/^\/([^/]+)/)?.at(1) ?? '';
    const signInUrl = new URL(`${locale ? `/${locale}` : ''}/sign-in`, req.url);
    const homeUrl = new URL(`${locale ? `/${locale}` : ''}/`, req.url);

    try {
      // Kiểm tra trạng thái đăng nhập
      await auth.protect();

      // Nếu đã đăng nhập
      if (isAuthPage(req)) {
        // Nếu đang ở trang auth, chuyển về home
        return NextResponse.redirect(homeUrl);
      }

      // Nếu đang ở trang gốc (/), cho phép truy cập
      if (pathname === '/' || pathname === `/${locale}`) {
        return handleI18nRouting(request);
      }
    } catch {
      // Nếu chưa đăng nhập
      if (!isAuthPage(req) && !isPublicRoute(req)) {
        // Nếu đang ở bất kỳ trang nào khác ngoại trừ auth và public, chuyển về sign-in
        return NextResponse.redirect(signInUrl);
      }

      // Nếu đang ở trang gốc (/), chuyển về sign-in
      if (pathname === '/' || pathname === `/${locale}`) {
        return NextResponse.redirect(signInUrl);
      }
    }

    return handleI18nRouting(request);
  })(request, event);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|monitoring|api|trpc|.*\\..*).*)',
};
