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
  title: 'Full-Stack Kanban & Annotation Studio',
  description: 'Professional workspace containing a Kanban board and image polygon annotator.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white">
        {/* Decorative background gradients for glassmorphism layout */}
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-indigo-900/15 blur-[120px]" />
          <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[70%] rounded-full bg-purple-900/10 blur-[120px]" />
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[50%] h-[50%] rounded-full bg-emerald-950/5 blur-[120px]" />
        </div>

        {/* Global Navigation Header */}
        <header className="sticky top-0 z-40 w-full bg-slate-950/60 border-b border-white/[0.05] backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition active:scale-95">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:text-white transition">
                Epic Studio
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
