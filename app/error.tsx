'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-xl text-gray-300">Something went wrong.</p>
      <p className="text-sm text-gray-500">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-300 cursor-pointer"
      >
        Try again
      </button>
    </main>
  );
}
