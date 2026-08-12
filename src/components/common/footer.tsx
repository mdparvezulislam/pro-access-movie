import Link from "next/link";
import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface-base py-10 mt-16 text-xs text-text-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-600 text-white font-bold">
              <Film className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-base sm:text-lg text-text-primary tracking-tight">
              PRO ACCESS <span className="text-red-500">MOVIE</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-6 text-text-secondary">
            <Link href="#" className="hover:text-text-primary transition-colors">
              Terms of Use
            </Link>
            <Link href="#" className="hover:text-text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-text-primary transition-colors">
              Help Center
            </Link>
            <Link href="#" className="hover:text-text-primary transition-colors">
              Corporate Info
            </Link>
          </div>
        </div>

        <div className="border-t border-border-muted pt-6 flex flex-col sm:flex-row items-center justify-between text-text-muted">
          <p>© {new Date().getFullYear()} PRO ACCESS MOVIE Bangladesh. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-medium">Built for high-definition Bangladesh streaming</p>
        </div>
      </div>
    </footer>
  );
}
