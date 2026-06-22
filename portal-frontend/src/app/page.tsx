'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Segment = {
  segment: string;
  avgPrice: number;
};

type PortalStats = {
  averagePrice: number;
  totalPropertiesAnalyzed: number;
  averageSquareFootage: number;
  segments: Segment[];
};

const DEFAULT_STATS: PortalStats = {
  averagePrice: 452000,
  totalPropertiesAnalyzed: 50,
  averageSquareFootage: 1850.5,
  segments: [
    { segment: 'Urban Center', avgPrice: 580000 },
    { segment: 'Suburban', avgPrice: 410000 },
    { segment: 'Rural', avgPrice: 290000 },
  ],
};

export default function HomePage() {
  const [stats, setStats] = useState<PortalStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Try Java analytics proxy first, fall back to housing-api directly
        let res = await fetch('http://localhost:8002/api/market/stats');
        if (!res.ok) {
          res = await fetch('http://localhost:8000/data/stats');
        }
        if (!res.ok) throw new Error('Failed to load portal summary');
        const data = await res.json();
        setStats(data);
        setIsLive(true);
      } catch (err: any) {
        setError(err.message || 'Unable to fetch portal summary');
        setIsLive(false);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">Housing Portal Ecosystem</p>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Unified Housing Analytics Dashboard</h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-500">Navigate the Python estimator and Java analytics experiences through a shared portal.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/estimator" className="group rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">App 1</p>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">Property Value Estimator</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Submit property features to the Python gateway and receive a model-based price prediction.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">Python</span>
          </div>
          <div className="mt-8 text-sm font-medium text-slate-700 group-hover:text-slate-900">Open Estimator →</div>
        </Link>

        <Link href="/analytics" className="group rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">App 2</p>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">Market Analytics Studio</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Review Java analytics metrics, export data, and run what-if simulations.</p>
            </div>
            <span className="rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700">Java</span>
          </div>
          <div className="mt-8 text-sm font-medium text-slate-700 group-hover:text-slate-900">Open Analytics →</div>
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Portal Summary</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Live summary of the Java analytics backend and its coverage for the portal.</p>
          </div>
          <div className="text-sm text-slate-500">
            {loading
              ? 'Loading summary…'
              : error
              ? `Limited live data — ${error}`
              : 'Live stats from the analytics service'}
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Average Price</p>
            <p className="mt-4 text-3xl font-bold text-emerald-700">
              {`$${stats.averagePrice.toLocaleString()}`}
            </p>
            <p className="mt-3 text-sm text-slate-600">Across the current analytics dataset.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Properties Analyzed</p>
            <p className="mt-4 text-3xl font-bold text-sky-700">
              {stats ? stats.totalPropertiesAnalyzed : '—'}
            </p>
            <p className="mt-3 text-sm text-slate-600">Total rows processed by the analytics service.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Average Size</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">
              {stats ? `${stats.averageSquareFootage.toLocaleString()} sqft` : '—'}
            </p>
            <p className="mt-3 text-sm text-slate-600">Average square footage across the dataset.</p>
          </div>
        </div>

        {stats && (
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {stats.segments.map((segment) => (
              <div key={segment.segment} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{segment.segment}</p>
                <p className="mt-4 text-3xl font-bold text-slate-900">${segment.avgPrice.toLocaleString()}</p>
                <p className="mt-3 text-sm text-slate-600">Segment average price</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
