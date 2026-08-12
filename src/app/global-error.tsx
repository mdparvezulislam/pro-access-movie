"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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
      <body className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
          <p className="text-sm text-text-secondary">
            An unexpected error occurred in the application.
          </p>
          <Button onClick={() => reset()} variant="cinematic">
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
