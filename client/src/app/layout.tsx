import type { Metadata } from 'next';
import { Geist_Mono, Nunito } from 'next/font/google';
import './globals.css';

const brandSans = Nunito({ variable: '--font-brand-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Kudos Kit', template: '%s · Kudos Kit' },
  description: 'Feedback inbox',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${brandSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-sm">{children}</body>
    </html>
  );
}
