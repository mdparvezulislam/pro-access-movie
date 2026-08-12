import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { getUserAccountDetails, getUserWatchHistory } from "@/features/user/lib/account-service";
import { AccountShell } from "@/components/account/AccountShell";
import { History, Heart, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ContentCard } from "@/components/content/ContentCard";
import { getPublicMovies } from "@/lib/content/public-catalog";

export const metadata: Metadata = {
  title: "Account Dashboard — PRO ACCESS MOVIE",
  description: "Manage your streaming profile, watch history, and viewing preferences.",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [accountDetails, history] = await Promise.all([
    getUserAccountDetails(),
    getUserWatchHistory(4),
  ]);

  const { items: sampleMovies } = await getPublicMovies();

  return (
    <AccountShell userEmail={accountDetails?.email} displayName={accountDetails?.displayName}>
      <div className="space-y-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-surface-base border border-border flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Watched Titles</p>
              <h3 className="text-2xl font-black text-text-primary mt-1">{history.length}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <History className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-base border border-border flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Saved Watchlist</p>
              <h3 className="text-2xl font-black text-red-500 mt-1">{sampleMovies.slice(0, 5).length}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-base border border-border flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Account Role</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1 capitalize">{accountDetails?.role || "User"}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Recent Watch Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <History className="h-5 w-5 text-blue-400" /> Recent Watch Activity
            </h2>
            <Link href="/account/history" className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {sampleMovies.length === 0 ? (
            <p className="text-xs text-text-muted">No recently watched content yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {sampleMovies.slice(0, 4).map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AccountShell>
  );
}
