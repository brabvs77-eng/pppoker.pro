import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    '/(ru|en|uz|kz|hy|tj)/:path*',
    '/((?!_next|_vercel|assets|includes|.*\\..*).*)',
  ],
};
