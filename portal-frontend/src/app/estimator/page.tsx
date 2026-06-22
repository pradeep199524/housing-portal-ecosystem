'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PropertyData {
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
}

interface EstimateHistory extends PropertyData {
  id: string;
  predicted_price: number;
  timestamp: string;
}

export default function PropertyEstimator() {
  const [formData, setFormData] = useState<PropertyData>({
    square_footage: 1550,
    bedrooms: 3,
    bathrooms: 2.0,
    year_built: 1997,
    lot_size: 6800.0,
    distance_to_city_center: 4.1,
    school_rating: 7.6
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<EstimateHistory[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // NEW: State for Comparison Requirement
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('propertyHistory');
    if (saved) setHistory(JSON.parse(saved));
    setMounted(true);
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem('propertyHistory', JSON.stringify(history));
  }, [history]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (data: PropertyData) => {
    const errs: Record<string, string> = {};
    if (!(data.square_footage > 0)) errs.square_footage = 'Square footage must be > 0';
    if (!(data.bedrooms > 0)) errs.bedrooms = 'Bedrooms must be > 0';
    if (!(data.bathrooms > 0)) errs.bathrooms = 'Bathrooms must be > 0';
    if (!(data.year_built >= 1800 && data.year_built <= 2026)) errs.year_built = 'Year built must be between 1800 and 2026';
    if (!(data.lot_size > 0)) errs.lot_size = 'Lot size must be > 0';
    if (!(data.distance_to_city_center >= 0)) errs.distance_to_city_center = 'Distance must be >= 0';
    if (!(data.school_rating >= 0 && data.school_rating <= 10)) errs.school_rating = 'School rating must be 0-10';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8001/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to fetch estimation');

      const data = await res.json();
      const newRecord: EstimateHistory = {
        ...formData,
        id: crypto.randomUUID(),
        predicted_price: data.predicted_price,
        timestamp: new Date().toLocaleTimeString()
      };
      setHistory(prev => [newRecord, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Comparison Logic
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else if (selectedIds.length < 2) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getDelta = () => {
    if (selectedIds.length !== 2) return null;
    const item1 = history.find(h => h.id === selectedIds[0])!;
    const item2 = history.find(h => h.id === selectedIds[1])!;
    return Math.abs(item1.predicted_price - item2.predicted_price);
  };

  return (
    <div className="p-6 space-y-8">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Property Value Estimator</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Panel */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          {Object.keys(formData).map((key) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 uppercase">{key.replace(/_/g, ' ')}</label>
                <input type="number" name={key} value={(formData as any)[key]} onChange={handleInputChange} className="mt-1 w-full rounded-md border p-2 text-sm" required />
                {formErrors[key] && <p className="text-xs text-red-600 mt-1">{formErrors[key]}</p>}
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-2.5 rounded-md text-sm">
            {loading ? 'Processing...' : 'Calculate Prediction'}
          </button>
        </form>

        {/* History & Delta Workspace */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Historical Tracking & Benchmarking</h2>
            
            {mounted && (
              <div style={{ width: '100%', height: 220, minWidth: 0, minHeight: 220 }} className="mb-4">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                  <LineChart data={history.map(h => ({ time: h.timestamp, price: h.predicted_price })).reverse()}>
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3">Time</th>
                  <th className="p-3">Price</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{item.timestamp}</td>
                    <td className="p-3 font-bold text-emerald-600">${item.predicted_price.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => toggleSelection(item.id)}
                        className={`px-3 py-1 text-xs rounded ${selectedIds.includes(item.id) ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}
                      >
                        {selectedIds.includes(item.id) ? 'Selected' : 'Compare'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delta Spread Display */}
          <div className="bg-slate-50 p-6 rounded-xl border border-dashed text-center">
            <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest mb-2">DELTA DISTRIBUTION SPREAD</h3>
            {selectedIds.length === 2 ? (
              <p className="text-2xl font-bold text-emerald-600">Spread: ${getDelta()?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            ) : (
              <p className="text-gray-400 text-sm">Select exactly two matrix estimates from the left-hand log column stack to trigger comparison spreads.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}