import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { getUserAccountDetails, getUserWatchHistory } from "@/features/user/lib/account-service";
import { AccountShell } from "@/components/account/AccountShell";
import { History } from "lucide-react";
import { ContentCard } from "@/components/content/ContentCard";
import { getPublicMovies } from "@/lib/content/public-catalog";

export const metadata: Metadata = {
  title: "Watch History — PRO ACCESS MOVIE",
  description: "View and manage your streaming watch history.",
};

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const accountDetails = await getUserAccountDetails();
  const historyItems = await getUserWatchHistory();
  const { items: sampleMovies } = await getPublicMovies();

  return (
    <AccountShell userEmail={accountDetails?.email} displayName={accountDetails?.displayName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <History className="h-5 w-5 text-blue-400" /> Watch History ({sampleMovies.slice(0, 6).length})
          </h2>
        </div>

        {sampleMovies.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-surface-base border border-border space-y-3">
            <History className="h-12 w-12 text-text-muted mx-auto" />
            <h3 className="text-base font-bold text-text-primary">No Watch History Found</h3>
            <p className="text-xs text-text-muted">Titles you watch will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sampleMovies.slice(0, 6).map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  );
}
