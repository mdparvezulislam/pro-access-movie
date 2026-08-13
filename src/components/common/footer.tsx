import Link from "next/link";
import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface-base/95 backdrop-blur-md mt-12 sm:mt-16 py-10 sm:py-12 text-xs text-text-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-bold shadow-md">
              <Film className="h-5 w-5" />
            </div>
            <span className="font-black text-lg sm:text-xl text-text-primary tracking-tight">
              PRO ACCESS <span className="text-red-500">MOVIE</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6 text-text-secondary font-bold text-xs sm:text-sm">
            <Link href="/movies" className="hover:text-red-500 transition-colors py-1">
              Movies
            </Link>
            <Link href="/series" className="hover:text-red-500 transition-colors py-1">
              Series
            </Link>
            <Link href="/categories" className="hover:text-red-500 transition-colors py-1">
              Categories
            </Link>
            <Link href="/genres" className="hover:text-red-500 transition-colors py-1">
              Genres
            </Link>
            <Link href="/my-list" className="hover:text-red-500 transition-colors py-1">
              My List
            </Link>
          </div>
        </div>

        <div className="border-t border-border/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-text-muted gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} PRO ACCESS MOVIE Bangladesh. All rights reserved.</p>
          <p className="font-semibold text-text-secondary">High-definition Bengali & International Streaming Platform</p>
        </div>
      </div>
    </footer>
  );
}
