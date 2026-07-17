'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="p-8 flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white font-sans">
        <h2 className="text-2xl font-bold mb-4 text-white">Something went wrong!</h2>
        <p className="text-sm text-slate-400 mb-6 max-w-md text-center">{error?.message || 'A global system error occurred.'}</p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
