"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Film, User, ShieldAlert, LogOut, Sun, Moon, Bookmark, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/features/auth/hooks/use-session";
import { signOutAction } from "@/features/auth/lib/actions";
import { useTheme } from "@/components/providers/theme-provider";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, profile, isAdmin, isLoading } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-40 w-full bg-background/85 backdrop-blur-xl border-b border-border/50 transition-all">
      <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left: Brand Logo & Main Navigation */}
        <div className="flex items-center gap-6 xl:gap-8 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
              <Film className="h-5 w-5 fill-current/20" />
            </div>
            <span className="font-black text-base sm:text-lg tracking-tight text-text-primary whitespace-nowrap">
              PRO ACCESS <span className="text-red-500">MOVIE</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs xl:text-sm font-semibold text-text-secondary whitespace-nowrap">
            <Link
              href="/"
              className={pathname === "/" ? "text-red-500 font-bold" : "hover:text-text-primary transition-colors"}
            >
              Home
            </Link>
            <Link
              href="/movies"
              className={pathname === "/movies" ? "text-red-500 font-bold" : "hover:text-text-primary transition-colors"}
            >
              Movies
            </Link>
            <Link
              href="/series"
              className={pathname === "/series" ? "text-red-500 font-bold" : "hover:text-text-primary transition-colors"}
            >
              Series
            </Link>
            <Link
              href="/categories"
              className={pathname === "/categories" ? "text-red-500 font-bold" : "hover:text-text-primary transition-colors"}
            >
              Categories
            </Link>
            <Link
              href="/genres"
              className={pathname === "/genres" ? "text-red-500 font-bold" : "hover:text-text-primary transition-colors"}
            >
              Genres
            </Link>
            <Link
              href="/my-list"
              className={pathname === "/my-list" || pathname === "/watchlist" ? "text-red-500 font-bold" : "hover:text-text-primary transition-colors"}
            >
              My List
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-500 dark:text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap shrink-0"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Admin Studio</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right: Search & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-36 lg:w-56 shrink-0">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted pointer-events-none" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 h-9 text-xs bg-surface-raised/80 border-border focus:border-red-500/50 text-text-primary placeholder:text-text-muted rounded-xl transition-all"
            />
          </form>

          {/* Mobile Search Button */}
          <Link href="/search" className="md:hidden shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-border text-text-primary hover:bg-surface-raised transition-colors min-h-[38px] min-w-[38px]"
              aria-label="Search"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          {/* Theme Toggle Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl border-border text-text-primary hover:bg-surface-raised transition-colors shrink-0 min-h-[38px] min-w-[38px]"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700 dark:text-slate-200" />}
          </Button>

          {!isLoading && (
            isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Link href="/history" className="hidden xl:flex shrink-0">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors min-h-[38px] min-w-[38px]" aria-label="Watch History" title="Watch History">
                    <Clock className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/my-list" className="hidden xl:flex shrink-0">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors min-h-[38px] min-w-[38px]" aria-label="My Saved List" title="My Saved List">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/profile" className="shrink-0">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-surface-raised border border-border text-xs text-text-primary cursor-pointer hover:border-red-500/40 transition-colors whitespace-nowrap min-h-[38px]">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center font-black text-xs text-white shadow-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline font-bold max-w-[90px] truncate">
                      {displayName}
                    </span>
                  </div>
                </Link>

                <form action={async () => { await signOutAction(); }} className="shrink-0">
                  <Button variant="outline" size="sm" type="submit" className="gap-1.5 text-xs font-bold rounded-xl border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors min-h-[38px] px-3 whitespace-nowrap" aria-label="Sign Out" title="Sign Out">
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="shrink-0">
                <Button variant="cinematic" size="sm" className="gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-red-600/20 min-h-[38px] whitespace-nowrap">
                  <User className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
