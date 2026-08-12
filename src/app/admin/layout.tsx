import Link from "next/link";
import { Film, LayoutDashboard, Video, Users, Settings, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-surface-base border-r border-border flex flex-col justify-between p-4 hidden md:flex shrink-0">
        <div className="space-y-6">
          {/* Logo Header */}
          <Link href="/admin" className="flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold">
              <Film className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-white tracking-wider">
                FLEX<span className="text-red-500">.</span>
              </span>
              <span className="text-[10px] text-red-400 font-mono font-semibold uppercase -mt-1">
                Admin Portal
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-raised text-white font-medium text-sm border border-border-muted"
            >
              <LayoutDashboard className="h-4 w-4 text-red-500" />
              <span>Dashboard</span>
            </Link>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-hover text-sm cursor-not-allowed opacity-60">
              <Video className="h-4 w-4" />
              <span>Catalog CRUD</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-hover text-sm cursor-not-allowed opacity-60">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-hover text-sm cursor-not-allowed opacity-60">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </div>
          </nav>
        </div>

        <div className="border-t border-border pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-hover text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Return to App</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-surface-base px-6 flex items-center justify-between">
          <h1 className="font-semibold text-sm text-text-secondary">
            Management Console (Phase 00 Shell)
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">Role: Admin</span>
            <div className="h-8 w-8 rounded-full bg-red-950 border border-red-700 flex items-center justify-center font-bold text-xs text-red-400">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 bg-background overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
