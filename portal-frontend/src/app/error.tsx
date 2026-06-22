'use client';

import React from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="p-8 text-center max-w-md mx-auto bg-white border border-red-200 rounded-xl shadow-sm mt-12 space-y-4">
          <h2 className="text-xl font-bold text-red-600">Portal Bridge Error</h2>
          <p className="text-sm text-gray-500">{error.message || 'An unexpected connection failure occurred.'}</p>
          <button 
            onClick={() => reset()} 
            className="px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 transition"
          >
            Retry Handshake
          </button>
        </div>
      </body>
    </html>
  );
}