import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { EmptyState } from "@/components/common/empty-state";
import { PlayCircle } from "lucide-react";

export const metadata = {
  title: "Continue Watching",
  description: "Pick up right where you left off on PRO ACCESS MOVIE.",
};

export default function ContinueWatchingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Continue Watching</h1>
          <p className="text-sm text-text-secondary">
            Resume titles you recently started watching.
          </p>
        </div>

        <EmptyState
          title="No Active Playback History"
          description="Start watching a movie or TV series episode to seamlessly resume playback across all your devices."
          icon={<PlayCircle className="h-10 w-10 text-red-500" />}
          actionLabel="Start Watching Now"
          actionHref="/movies"
        />
      </main>

      <Footer />
    </div>
  );
}
