"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Film, User, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signUpAction } from "@/features/auth/lib/actions";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await signUpAction({
        fullName,
        email,
        password,
        confirmPassword,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Registration failed.");
        toast.error("Sign-up failed", { description: result.error });
      } else {
        setSuccessMessage(result.message || "Account created successfully!");
        toast.success("Account created!", { description: result.message });
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-between items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

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

      <main className="w-full max-w-md my-auto">
        <Card className="glass-panel border-border shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-500 mb-2">
              <User className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              Create FLEX Account
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Join FLEX to stream unlimited movies, series, and originals
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="rounded-lg bg-red-950/50 border border-red-800 p-3 text-xs text-red-300">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-lg bg-emerald-950/50 border border-emerald-800 p-3 text-xs text-emerald-300">
                  {successMessage}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    className="pl-9"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isPending}
                    required
                  />
                </div>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isPending}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                variant="cinematic"
                className="w-full mt-2 gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Register</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 text-center text-xs text-text-muted">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-red-400 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

      <footer className="py-4 text-xs text-text-muted text-center">
        © {new Date().getFullYear()} FLEX Bangladesh. All rights reserved.
      </footer>
    </div>
  );
}
