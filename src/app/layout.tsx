import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { Providers } from '@src/components/layout/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'RegentMFB Activate',
  description: 'Staff-facing platform for RegentMFB open accounts, manage customers, track performance, and submit loan applications from anywhere.',
  applicationName: 'RegentMFB Activate',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#920793',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
