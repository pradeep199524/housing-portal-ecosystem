import React from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Unified Housing Analytics Portal',
  description: 'Unified portal for property estimation and market analysis',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen text-slate-900">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between max-w-6xl">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">Housing Portal Ecosystem</p>
              <p className="mt-1 text-sm text-slate-500">Unified access to Python estimator and Java market analytics.</p>
            </div>
            <nav className="flex flex-wrap gap-3">
              <Link href="/" className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                Home
              </Link>
              <Link href="/estimator" className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                Estimator
              </Link>
              <Link href="/analytics" className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                Analytics
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}