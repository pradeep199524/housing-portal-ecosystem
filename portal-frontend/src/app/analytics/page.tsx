import AnalyticsClient from './AnalyticsClient';

const DEFAULT_STATS = {
  averagePrice: 452000,
  totalPropertiesAnalyzed: 50,
  averageSquareFootage: 1850.5,
  segments: [
    { segment: 'Urban Center', avgPrice: 580000 },
    { segment: 'Suburban', avgPrice: 410000 },
    { segment: 'Rural', avgPrice: 290000 },
  ],
};

export default async function Page() {
  // Server-side initial data load using React Server Component
  try {
    const res = await fetch('http://localhost:8002/api/market/stats', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return <AnalyticsClient initialStats={data} />;
    }
    const fallback = await fetch('http://localhost:8000/data/stats', { cache: 'no-store' });
    if (fallback.ok) {
      const data = await fallback.json();
      return <AnalyticsClient initialStats={data} />;
    }
  } catch (err) {
    // silent fallthrough to default
  }

  return <AnalyticsClient initialStats={DEFAULT_STATS} />;
}
