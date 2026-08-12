import Link from "next/link";
import { Film, Lock, Mail, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-between items-center p-4 relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-7xl flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold">
            <Film className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-wider">
            FLEX<span className="text-red-500">.</span>
          </span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md my-auto">
        <Card className="glass-panel border-border shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-500 mb-2">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              Sign In to FLEX
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Enter your credentials to access your streaming profile
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Phase 00 Disabled Banner */}
            <div className="rounded-lg bg-red-950/40 border border-red-900/50 p-3 flex items-start gap-2 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                <strong>Phase 00 Foundation Shell:</strong> Authentication backend will be connected in Phase 01. Form controls are currently in preview mode.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9"
                  disabled
                  defaultValue="user@flex.bd"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-secondary">
                  Password
                </label>
                <span className="text-xs text-text-muted cursor-not-allowed">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  disabled
                  defaultValue="placeholder123"
                />
              </div>
            </div>

            <Button
              disabled
              variant="cinematic"
              className="w-full mt-2 cursor-not-allowed opacity-75"
            >
              Sign In (Supabase Wiring in Phase 01)
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 text-center text-xs text-text-muted">
            <p>
              New to FLEX?{" "}
              <Link href="/" className="text-red-400 font-semibold hover:underline">
                Explore catalog
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 text-xs text-text-muted text-center">
        © {new Date().getFullYear()} FLEX Bangladesh. All rights reserved.
      </footer>
    </div>
  );
}
