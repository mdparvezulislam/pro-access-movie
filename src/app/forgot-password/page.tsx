"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Film, Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPasswordAction } from "@/features/auth/lib/actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await resetPasswordAction(email);
      if (!result.success) {
        setErrorMessage(result.error || "Could not send reset instructions.");
        toast.error("Reset request failed", { description: result.error });
      } else {
        setSuccessMessage(result.message || "Reset instructions sent.");
        toast.success("Check your inbox", { description: result.message });
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
          <span className="font-extrabold text-xl text-text-primary tracking-tight">
            PRO ACCESS <span className="text-red-500">MOVIE</span>
          </span>
        </Link>
      </header>

      <main className="w-full max-w-md my-auto">
        <Card className="glass-panel border-border shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-500 mb-2">
              <Mail className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Enter your email and we&apos;ll send you a link to reset your password
            </CardDescription>
          </CardHeader>

          <CardContent>
            {successMessage ? (
              <div className="rounded-lg bg-emerald-950/50 border border-emerald-800 p-4 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <p className="text-xs text-emerald-300">{successMessage}</p>
                <p className="text-[11px] text-text-muted">
                  If an account exists for this email, you will receive instructions shortly.
                </p>
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

                <Button
                  type="submit"
                  disabled={isPending}
                  variant="cinematic"
                  className="w-full mt-2 gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 text-center text-xs text-text-muted">
            <p>
              Remembered your password?{" "}
              <Link href="/login" className="text-red-400 font-semibold hover:underline">
                Back to sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

      <footer className="py-4 text-xs text-text-muted text-center">
        <Link href="/login" className="inline-flex items-center gap-1 hover:text-red-400 transition-colors">
          <ArrowLeft className="h-3 w-3" />
          Sign in instead
        </Link>
      </footer>
    </div>
  );
}