"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Film,
  LayoutDashboard,
  Tv,
  Layers,
  ListVideo,
  Grid,
  Tag,
  FolderKanban,
  HardDrive,
  PlaySquare,
  Megaphone,
  BarChart3,
  Users,
  Bot,
  Settings,
  ArrowLeft,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    group: "MAIN",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "CONTENT",
    items: [
      { href: "/admin/movies", label: "Movies", icon: Film },
      { href: "/admin/series", label: "Series", icon: Tv },
      { href: "/admin/seasons", label: "Seasons", icon: Layers },
      { href: "/admin/episodes", label: "Episodes", icon: ListVideo },
      { href: "/admin/categories", label: "Categories", icon: Grid },
      { href: "/admin/genres", label: "Genres", icon: Tag },
      { href: "/admin/collections", label: "Collections", icon: FolderKanban },
    ],
  },
  {
    group: "MEDIA",
    items: [
      { href: "/admin/media", label: "Media Assets", icon: HardDrive },
      { href: "/admin/playback-sources", label: "Playback Sources", icon: PlaySquare },
    ],
  },
  {
    group: "MONETIZATION",
    items: [
      { href: "/admin/advertisements", label: "Advertisements", icon: Megaphone },
      { href: "/admin/campaigns", label: "Ad Campaigns", icon: Sparkles },
    ],
  },
  {
    group: "SYSTEM",
    items: [
      { href: "/admin/users", label: "Users & Roles", icon: Users },
      { href: "/admin/ai", label: "AI Enrichment", icon: Bot },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-surface-base border-r border-border flex flex-col justify-between p-4 transition-transform duration-300 md:static md:translate-x-0 shrink-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="space-y-5 overflow-y-auto pr-1">
          {/* Logo Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <Link
              href="/admin"
              className="flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-rose-700 text-white font-bold shadow-md shadow-red-900/30">
                <Film className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-text-primary">
                  PRO ACCESS <span className="text-red-500">ADMIN</span>
                </span>
                <span className="text-[10px] text-red-400 font-mono font-semibold uppercase -mt-0.5">
                  Management Studio
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-text-muted hover:text-text-primary p-1"
              aria-label="Close admin menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Grouped Navigation */}
          <nav className="space-y-4 pt-1">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                <span className="px-3 text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">
                  {group.group}
                </span>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                        isActive
                          ? "bg-red-600/10 text-red-400 font-bold border border-red-500/20"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isActive ? "text-red-500" : "text-text-muted"
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-border pt-3 mt-3 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-text-muted" />
            <span>Back to Platform</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-surface-base px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-raised"
              aria-label="Open admin sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider hidden sm:inline">
                Admin Console
              </span>
              <span className="text-xs text-text-muted hidden sm:inline">•</span>
              <span className="text-sm font-bold text-text-primary capitalize">
                {pathname === "/admin"
                  ? "Dashboard Overview"
                  : pathname.split("/admin/")[1]?.replace("-", " ") || "Admin"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 border-border text-text-primary"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-slate-700" />
              )}
            </Button>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-raised border border-border text-xs">
              <div className="h-5 w-5 rounded-full bg-red-600 flex items-center justify-center font-bold text-[10px] text-white">
                AD
              </div>
              <span className="font-semibold text-text-primary text-xs">
                Super Admin
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
