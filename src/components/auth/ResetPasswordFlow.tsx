"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle2, AlertTriangle, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { updatePasswordAction } from "@/features/auth/lib/actions";
import { resetPasswordSchema } from "@/lib/validation/auth";

type TokenState =
  | { status: "loading" }
  | { status: "invalid" }
  | { status: "ready" };

function parseHashParams(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  const trimmed = hash.startsWith("#") ? hash.slice(1) : hash;
  for (const [key, value] of new URLSearchParams(trimmed).entries()) {
    params[key] = value;
  }
  return params;
}

export function ResetPasswordFlow() {
  const router = useRouter();
  const [tokenState, setTokenState] = useState<TokenState>({ status: "loading" });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function exchangeRecoveryTokens() {
      try {
        const params = parseHashParams(window.location.hash);
        const searchCode = new URLSearchParams(window.location.search).get("code");

        if (searchCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(searchCode);
          if (!error && !cancelled) {
            setTokenState({ status: "ready" });
            return;
          }
        }

        if (params.access_token && params.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          if (!error && !cancelled) {
            setTokenState({ status: "ready" });
            return;
          }
        }

        if (params.type === "recovery" && !params.access_token) {
          if (!cancelled) setTokenState({ status: "invalid" });
          return;
        }

        if (!cancelled) setTokenState({ status: "invalid" });
      } catch {
        if (!cancelled) setTokenState({ status: "invalid" });
      }
    }

    exchangeRecoveryTokens();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message || "Please check your new password.");
      return;
    }

    startTransition(async () => {
      const result = await updatePasswordAction(parsed.data);
      if (!result.success) {
        setErrorMessage(result.error || "Failed to update your password.");
        toast.error("Password update failed", { description: result.error });
      } else {
        setSuccessMessage(result.message || "Your password has been updated.");
        toast.success("Password updated", { description: result.message });
        setTimeout(() => router.push("/login"), 1500);
      }
    });
  };

  return (
    <Card className="glass-panel border-border shadow-2xl">
      {tokenState.status === "loading" && (
        <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
          <p className="text-xs text-text-secondary">Verifying your reset link...</p>
        </CardContent>
      )}

      {tokenState.status === "invalid" && (
        <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <CardTitle className="text-lg font-bold">Invalid or expired link</CardTitle>
          <p className="text-xs text-text-secondary max-w-sm">
            This password reset link is invalid or has already been used. Please request a new one.
          </p>
          <Button asChild variant="cinematic" size="sm" className="mt-2">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        </CardContent>
      )}

      {tokenState.status === "ready" && (
        <>
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-500 mb-2">
              <KeyRound className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              Choose a New Password
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Set a strong password to secure your PRO ACCESS MOVIE account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {successMessage ? (
              <div className="rounded-lg bg-emerald-950/50 border border-emerald-800 p-4 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <p className="text-xs text-emerald-300">{successMessage}</p>
                <p className="text-[11px] text-text-muted">Redirecting you to sign in...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="rounded-lg bg-red-950/50 border border-red-800 p-3 text-xs text-red-300">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary">
                    New Password
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
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary">
                    Confirm New Password
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
                      autoComplete="new-password"
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
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 text-center text-xs text-text-muted">
            <p>
              Remembered it?{" "}
              <Link href="/login" className="text-red-400 font-semibold hover:underline">
                Back to sign in
              </Link>
            </p>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
