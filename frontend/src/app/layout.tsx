import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { AuthNav } from '@/components/AuthNav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'VAi Radiology — Radiology Intelligence Suite',
  description: 'Enterprise-grade medical imaging annotation and task management platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body
        suppressHydrationWarning={true}
        className="min-h-full flex flex-col bg-[#0B0F19] text-slate-100 font-sans selection:bg-teal-500/30 selection:text-white"
      >
        {/* Decorative background gradients for glassmorphism layout */}
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-teal-900/10 blur-[120px]" />
          <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[70%] rounded-full bg-slate-800/20 blur-[120px]" />
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[50%] h-[50%] rounded-full bg-cyan-950/8 blur-[120px]" />
        </div>

        {/* Global Navigation Header */}
        <header className="sticky top-0 z-40 w-full bg-[#0B0F19]/80 border-b border-white/[0.05] backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-900/40 group-hover:scale-105 transition active:scale-95">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-teal-100 transition">
                VAi Radiology
              </span>
            </Link>

            <AuthNav />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
