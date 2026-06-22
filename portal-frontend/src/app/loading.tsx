import React from 'react';

export default function GlobalLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      <p className="text-gray-500 font-medium">Assembling platform views...</p>
    </div>
  );
}