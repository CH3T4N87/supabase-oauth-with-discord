import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppNav from '@/components/app-nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Esports Platform',
  description: 'Find your team. Build your legacy.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 antialiased`}>
        <AppNav />
        {children}
      </body>
    </html>
  );
}