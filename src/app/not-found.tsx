import Link from "next/link";
import { Film, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center justify-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-raised border border-border text-red-500 mb-6">
        <Film className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-text-primary tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-text-primary mb-3">Content Not Found</h2>
      <p className="text-sm text-text-secondary max-w-md mb-8 leading-relaxed">
        The movie, series, or page you were looking for might have been moved, removed, or is temporarily unavailable.
      </p>
      <Button variant="cinematic" asChild className="gap-2">
        <Link href="/">
          <Home className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </Button>
    </div>
  );
}
