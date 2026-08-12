"use client";

import Link from "next/link";
import { Search, Film, User, ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/features/auth/hooks/use-session";
import { signOutAction } from "@/features/auth/lib/actions";

export function Navbar() {
  const { isAuthenticated, user, profile, isLoading } = useSession();

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
              <span className="font-extrabold text-2xl tracking-wider text-white">
                FLEX<span className="text-red-500">.</span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
            <Link href="/" className="hover:text-white transition-colors text-white font-semibold">
              Home
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Movies
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Series
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Bengali Classics
            </Link>
            <Link href="/admin" className="flex items-center gap-1 hover:text-red-400 transition-colors text-xs text-text-muted">
              <ShieldAlert className="h-3.5 w-3.5" />
              Admin
            </Link>
          </nav>
        </div>

        {/* Right: Search & Auth Actions */}
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block w-48 lg:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              type="search"
              placeholder="Search movies, shows..."
              className="pl-9 h-9 text-xs bg-surface-raised border-border-muted focus:border-red-500/50"
            />
          </div>

          {!isLoading && (
            isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-surface-raised border border-border text-xs text-white">
                  <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center font-bold text-[10px] text-white">
                    {(profile?.display_name || user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline font-medium max-w-[100px] truncate">
                    {profile?.display_name || user?.email?.split("@")[0]}
                  </span>
                </div>

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
