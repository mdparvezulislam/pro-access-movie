import React, { Suspense } from "react";
import Link from "next/link";
import { Film } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-between items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <header className="w-full max-w-7xl flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold">
            <Film className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-wider">
            PRO ACCESS MOVIE<span className="text-red-500">.</span>
          </span>
        </Link>
      </header>

      <main className="w-full max-w-md my-auto">
        <Suspense fallback={<Card className="glass-panel p-8 text-center text-text-muted">Loading...</Card>}>
          <RegisterForm />
        </Suspense>
      </main>

      <footer className="py-4 text-xs text-text-muted text-center">
        © {new Date().getFullYear()} PRO ACCESS MOVIE Bangladesh. All rights reserved.
      </footer>
    </div>
  );
}
