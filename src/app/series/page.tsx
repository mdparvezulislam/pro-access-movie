import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { PosterCard } from "@/components/cards/poster-card";
import { getPublishedSeries } from "@/lib/content/series";
import { Tv } from "lucide-react";

export default async function SeriesPage() {
  const seriesList = await getPublishedSeries({ limit: 30 });

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
            <Tv className="h-7 w-7 text-red-500" />
            <span>TV & Web Series</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Stream original Bengali drama series, multi-season web thrillers, and TV shows
          </p>
        </div>

        {/* Series Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {seriesList.map((s: (typeof seriesList)[number]) => (
            <PosterCard
              key={s.id}
              id={s.id}
              title={s.title}
              titleBn={s.title_bn}
              slug={s.slug}
              type="series"
              posterUrl={(s as { posterUrl?: string }).posterUrl || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop"}
              releaseYear={s.release_year}
              rating={s.rating}
              badgeText="SERIES"
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
