"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface SegmentData {
  segment: string;
  avgPrice: number;
}

interface MarketStats {
  averagePrice: number;
  totalPropertiesAnalyzed: number;
  averageSquareFootage: number;
  segments: SegmentData[];
}

export default function AnalyticsClient({ initialStats }:{ initialStats: MarketStats }) {
  const [stats, setStats] = useState<MarketStats | null>(initialStats || null);
  const [selectedSegment, setSelectedSegment] = useState<string>('All');
  const [whatIfPrice, setWhatIfPrice] = useState<number | null>(null);
  const [sqftInput, setSqftInput] = useState<number>(1850);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(!initialStats);
  
  // Tracks the currently selected SegmentData objects for comparison
  const [selectedSegments, setSelectedSegments] = useState<SegmentData[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        let response = await fetch('http://localhost:8002/api/market/stats');
        if (!response.ok) response = await fetch('http://localhost:8000/data/stats');
        if (!response.ok) throw new Error('Stats unavailable');
        const data = await response.json();
        if (mounted) setStats(data);
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const segmentsOptions = useMemo(() => {
    if (!stats?.segments) return ['All'];
    return ['All', ...stats.segments.map((s) => s.segment)];
  }, [stats]);

  const filteredAndSorted = useMemo(() => {
    if (!stats?.segments) return [] as SegmentData[];
    let arr = stats.segments.slice();
    if (selectedSegment !== 'All') arr = arr.filter((s) => s.segment === selectedSegment);
    arr.sort((a, b) => (sortAsc ? a.avgPrice - b.avgPrice : b.avgPrice - a.avgPrice));
    return arr;
  }, [stats, selectedSegment, sortAsc]);

  const handleExportCSV = () => {
    if (!stats?.segments) return;
    const headers = ["Location Segment", "Average Price"];
    const rows = filteredAndSorted.map(s => [s.segment, s.avgPrice]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "market_analysis.csv");
    a.click();
  };

  const handleExportPDF = () => {
    if (!stats?.segments) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Market Analysis - Segments', 14, 20);
    doc.setFontSize(11);
    const startY = 30;
    doc.text('Segment', 14, startY);
    doc.text('Avg Price', 100, startY);
    let y = startY + 8;
    filteredAndSorted.forEach((r) => {
      doc.text(String(r.segment), 14, y);
      doc.text(`$${r.avgPrice.toLocaleString()}`, 100, y);
      y += 8;
    });
    doc.save('market_analysis.pdf');
  };

  const handleWhatIfSimulation = async () => {
    setSimulating(true);
    try {
      const payload = {
        square_footage: sqftInput,
        bedrooms: 3,
        bathrooms: 2.0,
        year_built: 2005,
        lot_size: 6000.0,
        distance_to_city_center: 5.0,
        school_rating: 7.0,
      };

      const response = await fetch('http://localhost:8002/api/market/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Simulation request failed');
      const data = await response.json();

      if (data.predicted_price !== undefined) {
        setWhatIfPrice(Number(data.predicted_price));
      } else if (Array.isArray(data.predictions) && data.predictions.length > 0) {
        setWhatIfPrice(Number(data.predictions[0]));
      } else {
        setWhatIfPrice(null);
      }
    } catch (err) {
      console.error('Simulation failed:', err);
      setWhatIfPrice(null);
    } finally {
      setSimulating(false);
    }
  };

  // Click handler to select/deselect segment rows for comparison
  const handleRowClick = (segmentItem: SegmentData) => {
    const isAlreadySelected = selectedSegments.some(s => s.segment === segmentItem.segment);
    
    if (isAlreadySelected) {
      setSelectedSegments(selectedSegments.filter(s => s.segment !== segmentItem.segment));
    } else if (selectedSegments.length < 2) {
      setSelectedSegments([...selectedSegments, segmentItem]);
    } else {
      setSelectedSegments([segmentItem]);
    }
  };

  // Calculate live delta values when exactly two segments are selected
  const isComparisonReady = selectedSegments.length === 2;
  const absoluteDelta = isComparisonReady ? Math.abs(selectedSegments[0].avgPrice - selectedSegments[1].avgPrice) : 0;

  return (
    <div className="p-6 space-y-8">
      <header className="border-b pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Property Market Analysis</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <p className="text-sm text-gray-500">{isOnline ? 'Java Pipeline: Online' : 'Java Pipeline: Connecting...'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="px-3 py-2 bg-sky-600 text-white rounded text-sm font-medium hover:bg-sky-700 transition-colors">Export CSV</button>
          <button onClick={handleExportPDF} className="px-3 py-2 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700 transition-colors">Export PDF</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Filter:</label>
              <select value={selectedSegment} onChange={(e) => setSelectedSegment(e.target.value)} className="border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {segmentsOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <button onClick={() => setSortAsc(s => !s)} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors">
                Sort by Avg Price: {sortAsc ? 'Asc' : 'Desc'}
              </button>
            </div>
          </div>

          {!loading && (
            <div style={{ width: '100%', height: 260, minWidth: 0, minHeight: 260 }}>
              <ResponsiveContainer width="100%" height={260} minWidth={0} minHeight={260}>
                <BarChart data={filteredAndSorted} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="avgPrice">
                    {filteredAndSorted.map((entry, index) => {
                      const isSelected = selectedSegments.some(s => s.segment === entry.segment);
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isSelected ? '#4f46e5' : (index % 2 === 0 ? '#0ea5a0' : '#06b6d4')} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <p className="text-xs text-gray-400 mb-2">💡 Click any two rows below to select them for Delta Distribution.</p>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-600 font-semibold text-xs uppercase">
                  <th className="p-3">Segment</th>
                  <th className="p-3">Average Price</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((s) => {
                  const isRowSelected = selectedSegments.some(item => item.segment === s.segment);
                  return (
                    <tr 
                      key={s.segment} 
                      onClick={() => handleRowClick(s)}
                      className={`border-b cursor-pointer transition-colors ${isRowSelected ? 'bg-indigo-50 font-medium text-indigo-900 hover:bg-indigo-100' : 'hover:bg-gray-50'}`}
                    >
                      <td className="p-3 flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${isRowSelected ? 'bg-indigo-600' : 'bg-transparent border border-gray-300'}`} />
                        {s.segment}
                      </td>
                      <td className="p-3">${s.avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="bg-slate-50 p-6 rounded-xl border self-start space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">What-if Simulation</h2>
            <label className="block text-xs uppercase font-bold tracking-wider text-gray-500">Square Footage</label>
            <input 
              type="number" 
              value={sqftInput} 
              onChange={(e) => setSqftInput(Number(e.target.value))} 
              className="w-full border rounded p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
            <button 
              onClick={handleWhatIfSimulation} 
              disabled={simulating} 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {simulating ? 'Simulating...' : 'Run Simulation'}
            </button>
            {whatIfPrice !== null && (
              <div className="p-3 bg-white rounded border border-gray-100 text-sm">
                <span className="text-xs text-gray-400 block">Predicted Price:</span>
                <span className="text-lg font-bold text-emerald-600">${whatIfPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Delta Distribution</h3>
            {isComparisonReady ? (
              <div className="p-3 bg-indigo-50 rounded border border-indigo-100 text-xs text-indigo-900 space-y-2">
                <div>
                  <span className="text-gray-500">Comparing:</span>{' '}
                  <span className="font-semibold text-gray-800">{selectedSegments[0].segment} vs {selectedSegments[1].segment}</span>
                </div>
                <div className="text-lg font-bold text-indigo-700">
                  Spread: ${absoluteDelta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded text-center bg-gray-50">
                <p className="text-gray-400 text-xs">Select two items from the table to compute delta.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}