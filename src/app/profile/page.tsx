import { requireAuth } from "@/features/auth/lib/auth-helpers";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { User, ShieldCheck, Mail, Calendar, Settings } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProfileSettings } from "@/features/user/components/profile-settings";
import { getCurrentUserProfile } from "@/features/user/lib/profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireAuth("/profile");
  const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "User";
  const profile = await getCurrentUserProfile();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <User className="h-7 w-7 text-red-500" />
            <span>Account Profile</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage your personal profile, subscription, and platform settings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card className="bg-surface-base border-border md:col-span-1">
            <CardHeader className="text-center">
              <div className="h-20 w-20 rounded-full bg-red-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-xl shadow-red-950/40">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <CardTitle className="text-lg font-bold text-text-primary mt-3">
                {displayName}
              </CardTitle>
              <CardDescription className="text-xs text-text-secondary">
                PRO ACCESS MOVIE Member
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Account Details Card */}
          <Card className="bg-surface-base border-border md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-bold text-text-primary flex items-center gap-2">
                <Settings className="h-5 w-5 text-red-500" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-text-muted" />
                  <div>
                    <p className="text-text-muted">Email Address</p>
                    <p className="font-semibold text-text-primary">{user.email}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-[10px] font-bold text-emerald-400">
                  Verified
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-text-muted" />
                  <div>
                    <p className="text-text-muted">Account Status</p>
                    <p className="font-semibold text-text-primary">PRO ACCESS MOVIE Standard Access</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-[10px] font-bold text-red-400">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-text-muted" />
                  <div>
                    <p className="text-text-muted">Member Since</p>
                    <p className="font-semibold text-text-primary">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "2026"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {profile && <ProfileSettings initialProfile={profile} />}
      </main>

      <Footer />
    </div>
  );
}
