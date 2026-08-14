import Link from "next/link";
import { Film, ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
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
        <ForgotPasswordForm />
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