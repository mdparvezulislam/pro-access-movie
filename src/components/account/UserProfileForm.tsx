"use client";

import React, { useState } from "react";
import { User, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAccountProfile } from "@/features/user/lib/account-service";

interface UserProfileFormProps {
  profile: UserAccountProfile | null;
}

export function UserProfileForm({ profile }: UserProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferences?.preferredLanguage || "bn");
  const [defaultQuality, setDefaultQuality] = useState(profile?.preferences?.defaultQuality || "HD");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-surface-base border border-border space-y-6 shadow-xl max-w-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <User className="h-5 w-5 text-red-500" /> Edit Profile Information
          </h2>
          <p className="text-xs text-text-muted">Update your display name and viewing preferences.</p>
        </div>
        {savedSuccess && (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Saved!
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-text-muted block mb-1">Display Name</label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-3 rounded-xl bg-surface-raised border border-border text-sm text-text-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-text-muted block mb-1">Account Email (Protected)</label>
          <input
            type="email"
            disabled
            value={profile?.email || ""}
            className="w-full p-3 rounded-xl bg-surface-raised/50 border border-border text-sm text-text-muted font-mono cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-text-muted block mb-1">Preferred Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface-raised border border-border text-xs text-text-primary focus:outline-none"
            >
              <option value="bn">Bangla (বাংলা)</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-text-muted block mb-1">Default Quality</label>
            <select
              value={defaultQuality}
              onChange={(e) => setDefaultQuality(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface-raised border border-border text-xs text-text-primary focus:outline-none"
            >
              <option value="4K">4K Ultra HD</option>
              <option value="HD">1080p Full HD</option>
              <option value="SD">720p HD</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border flex justify-end">
        <Button type="submit" variant="cinematic" className="gap-2">
          <Sparkles className="h-4 w-4" /> Save Profile Updates
        </Button>
      </div>
    </form>
  );
}
