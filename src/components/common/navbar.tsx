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
  const { isAuthenticated, user, profile, isLoading } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-900/40 group-hover:scale-105 transition-transform">
              <Film className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-wider text-text-primary">
                FLEX<span className="text-red-500">.</span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
            <Link
              href="/"
              className={pathname === "/" ? "text-text-primary font-bold" : "hover:text-text-primary transition-colors"}
            >
              Home
            </Link>
            <Link
              href="/movies"
              className={pathname === "/movies" ? "text-text-primary font-bold" : "hover:text-text-primary transition-colors"}
            >
              Movies
            </Link>
            <Link
              href="/series"
              className={pathname === "/series" ? "text-text-primary font-bold" : "hover:text-text-primary transition-colors"}
            >
              Series
            </Link>
            <Link
              href="/categories"
              className={pathname === "/categories" ? "text-text-primary font-bold" : "hover:text-text-primary transition-colors"}
            >
              Categories
            </Link>
            <Link
              href="/watchlist"
              className={pathname === "/watchlist" ? "text-text-primary font-bold" : "hover:text-text-primary transition-colors"}
            >
              My List
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1 hover:text-red-400 transition-colors text-xs text-text-muted"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Admin Studio
            </Link>
          </nav>
        </div>

        {/* Right: Theme Toggle, Search & Auth Actions */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-44 lg:w-60">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              type="search"
              placeholder="Search movies, shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-surface-raised border-border focus:border-red-500/50"
            />
          </form>

          {/* Light / Dark Mode Switcher */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 border-border text-text-primary hover:bg-surface-raised"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </Button>

          {!isLoading && (
            isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/history" className="hidden sm:flex">
                  <Button variant="outline" size="icon" className="h-9 w-9 border-border text-text-secondary hover:text-text-primary">
                    <Clock className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/watchlist" className="hidden sm:flex">
                  <Button variant="outline" size="icon" className="h-9 w-9 border-border text-text-secondary hover:text-text-primary">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-raised border border-border text-xs text-text-primary cursor-pointer hover:border-red-500/50 transition-colors">
                    <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center font-bold text-[10px] text-white">
                      {(profile?.display_name || user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline font-medium max-w-[90px] truncate">
                      {profile?.display_name || user?.email?.split("@")[0]}
                    </span>
                  </div>
                </Link>

                <form action={async () => { await signOutAction(); }}>
                  <Button variant="outline" size="sm" type="submit" className="gap-1 text-xs">
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </form>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="cinematic" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
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
