import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { getUserAccountDetails } from "@/features/user/lib/account-service";
import { getUserWatchHistory } from "@/features/user/lib/history";
import { AccountShell } from "@/components/account/AccountShell";
import { History } from "lucide-react";
import { PosterCard } from "@/components/cards/poster-card";

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

  return (
    <AccountShell userEmail={accountDetails?.email} displayName={accountDetails?.displayName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <History className="h-5 w-5 text-blue-400" /> Watch History ({historyItems.length})
          </h2>
        </div>

        {historyItems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-surface-base border border-border space-y-3">
            <History className="h-12 w-12 text-text-muted mx-auto" />
            <h3 className="text-base font-bold text-text-primary">No Watch History Found</h3>
            <p className="text-xs text-text-muted">Titles you watch will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {historyItems.map((item) => (
              <PosterCard
                key={item.id}
                id={item.id}
                title={item.title}
                titleBn={item.titleBn}
                slug={item.slug}
                type={item.type}
                posterUrl={item.posterUrl || ""}
                releaseYear={item.releaseYear}
                rating={item.rating}
                badgeText="WATCHED"
              />
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  );
}

