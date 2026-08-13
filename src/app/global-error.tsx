"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#09090e] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
          <p className="text-sm text-neutral-400">
            An unexpected error occurred in the application.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-lg"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
