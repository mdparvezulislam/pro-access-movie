"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, Search, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide mobile bottom nav inside full video player watch page
  if (pathname.startsWith("/watch/")) {
    return null;
  }

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/series", label: "Series", icon: Tv },
    { href: "/search", label: "Search", icon: Search },
    { href: "/my-list", label: "My List", icon: Bookmark },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-border px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] min-w-[48px] py-1 px-2.5 rounded-xl text-[10px] font-medium active:scale-95",
                isActive
                  ? "text-red-500 font-bold bg-red-600/10"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-raised/50"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
