import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { EmptyState } from "@/components/common/empty-state";
import { LandscapeCard } from "@/components/cards/landscape-card";
import { getContinueWatching } from "@/features/user/lib/history";
import { PlayCircle } from "lucide-react";

export const metadata = {
  title: "Continue Watching — PRO ACCESS MOVIE",
  description: "Pick up right where you left off on PRO ACCESS MOVIE.",
};

export default async function ContinueWatchingPage() {
  const items = await getContinueWatching();

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
            <PlayCircle className="h-7 w-7 text-red-500" />
            <span>Continue Watching</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Resume titles you recently started watching across your devices
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Link key={item.id} href={`/watch/${item.type}/${item.slug}`}>
                <LandscapeCard
                  id={item.id}
                  title={item.title}
                  titleBn={item.titleBn}
                  slug={item.slug}
                  type={item.type}
                  backdropUrl={item.backdropUrl || item.posterUrl || ""}
                  releaseYear={item.releaseYear}
                  rating={item.rating}
                />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Active Playback History"
            description="Start watching a movie or TV series episode to seamlessly resume playback across all your devices."
            icon={<PlayCircle className="h-10 w-10 text-red-500" />}
            actionLabel="Start Watching Now"
            actionHref="/movies"
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
