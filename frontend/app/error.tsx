'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-extrabold text-foreground">Something went wrong!</h2>
      <p className="text-sm text-muted-foreground">{error?.message || 'An error occurred loading this section.'}</p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
