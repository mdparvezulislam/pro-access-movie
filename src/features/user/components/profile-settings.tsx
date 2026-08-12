"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type ProfileView } from "@/features/user/lib/profile";
import { updateProfileAction } from "@/features/user/lib/profile-actions";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

interface ProfileSettingsProps {
  initialProfile: ProfileView;
}

export function ProfileSettings({ initialProfile }: ProfileSettingsProps) {
  const { setTheme } = useTheme();
  const [displayName, setDisplayName] = useState(initialProfile.displayName ?? "");
  const [themePreference, setThemePreference] = useState<"dark" | "light">(initialProfile.themePreference);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProfileAction({ displayName, themePreference });
      if (result.success) {
        setTheme(themePreference);
        toast.success("Profile updated", { description: result.message });
      } else {
        toast.error("Update failed", { description: result.message });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="bg-surface-base border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold text-text-primary">Profile Settings</CardTitle>
          <CardDescription className="text-xs text-text-secondary">
            Manage your public display name and theme preference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary">Display Name</label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              disabled={isPending}
              maxLength={60}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary">Theme Preference</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setThemePreference("dark")}
                disabled={isPending}
                aria-pressed={themePreference === "dark"}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-colors",
                  themePreference === "dark"
                    ? "border-red-500/60 bg-red-950/40 text-red-300"
                    : "border-border bg-surface-raised text-text-secondary hover:border-red-500/30"
                )}
              >
                <Moon className="h-4 w-4" />
                Dark
              </button>
              <button
                type="button"
                onClick={() => setThemePreference("light")}
                disabled={isPending}
                aria-pressed={themePreference === "light"}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-colors",
                  themePreference === "light"
                    ? "border-red-500/60 bg-red-950/40 text-red-300"
                    : "border-border bg-surface-raised text-text-secondary hover:border-red-500/30"
                )}
              >
                <Sun className="h-4 w-4" />
                Light
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" variant="cinematic" size="sm" disabled={isPending} className="gap-2">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Changes</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}