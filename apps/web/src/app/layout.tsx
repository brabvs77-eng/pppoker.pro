import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { CoreStylesheets } from '@/components/CoreStylesheets';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://pppoker.pro'),
  title: {
    default: 'Nuts — онлайн покер клуб PPPoker',
    template: '%s',
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <CoreStylesheets />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
