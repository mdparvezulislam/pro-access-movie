import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { getUserAccountDetails } from "@/features/user/lib/account-service";
import { AccountShell } from "@/components/account/AccountShell";
import { Sliders, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Account Settings — PRO ACCESS MOVIE",
  description: "Configure viewing preferences and streaming settings.",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const accountDetails = await getUserAccountDetails();

  return (
    <AccountShell userEmail={accountDetails?.email} displayName={accountDetails?.displayName}>
      <div className="space-y-6 max-w-2xl">
        <div className="p-6 rounded-3xl bg-surface-base border border-border space-y-6 shadow-xl">
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            <Sliders className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-text-primary">Playback & Streaming Preferences</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-raised border border-border">
              <div>
                <h4 className="text-sm font-bold text-text-primary">Autoplay Next Episode</h4>
                <p className="text-xs text-text-muted">Automatically load the next TV series episode when finished.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-red-600 cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-raised border border-border">
              <div>
                <h4 className="text-sm font-bold text-text-primary">Background Audio Playback</h4>
                <p className="text-xs text-text-muted">Keep streaming audio playing when switching browser tabs.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-red-600 cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface-base border border-border space-y-6 shadow-xl">
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-text-primary">Privacy & Security</h2>
          </div>

          <div className="space-y-2 text-xs text-text-muted leading-relaxed">
            <p>Your streaming session is protected with Supabase Row Level Security (RLS).</p>
            <p>Your watch progress and saved watchlist items are strictly isolated to your account.</p>
          </div>
        </div>
      </div>
    </AccountShell>
  );
}
