"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/common/error-state";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (error?.message) {
      console.error("[PRO ACCESS MOVIE] Application boundary caught error:", error.message);
    }
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <ErrorState
        title="Streaming Service Error"
        description="We couldn't render this page. This may be due to network connectivity or system maintenance."
        onRetry={reset}
      />
    </div>
  );
}
