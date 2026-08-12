"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, History, Heart, Clock, Settings, LayoutDashboard } from "lucide-react";

interface AccountShellProps {
  children: React.ReactNode;
  userEmail?: string;
  displayName?: string;
}

const ACCOUNT_NAV_ITEMS = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/history", label: "Watch History", icon: History },
  { href: "/my-list", label: "My List", icon: Heart },
  { href: "/continue-watching", label: "Continue Watching", icon: Clock },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export function AccountShell({ children, userEmail, displayName }: AccountShellProps) {
  const pathname = usePathname();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Profile Bar */}
      <div className="p-6 rounded-3xl bg-surface-base border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-xl flex items-center justify-center shadow-lg">
            {(displayName || userEmail || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-text-primary">{displayName || "Streaming Member"}</h1>
            <p className="text-xs text-text-muted font-mono">{userEmail || "member@proaccessmovie.com"}</p>
          </div>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          Active Member
        </span>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 border-b border-border">
        {ACCOUNT_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shrink-0 ${
                isActive
                  ? "bg-red-600 text-white shadow-lg shadow-red-950/40"
                  : "bg-surface-base text-text-muted hover:text-text-primary hover:bg-surface-raised border border-border"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Tab Child Content */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}
