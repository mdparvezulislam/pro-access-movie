import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { PosterCard } from "@/components/cards/poster-card";
import { getPublicMovies, getPublicSeries } from "@/lib/content/public-catalog";
import { Compass } from "lucide-react";

export const metadata = {
  title: "Genres — PRO ACCESS MOVIE",
  description: "Browse movies and web series by genre on PRO ACCESS MOVIE.",
};

export const dynamic = "force-dynamic";

const GENRE_LIST = [
  { id: "action", name: "Action", name_bn: "অ্যাকশন" },
  { id: "bengali", name: "Bengali", name_bn: "বাংলা" },
  { id: "crime", name: "Crime", name_bn: "ক্রাইম" },
  { id: "thriller", name: "Thriller", name_bn: "থ্রিলার" },
  { id: "drama", name: "Drama", name_bn: "ড্রামা" },
  { id: "mystery", name: "Mystery", name_bn: "রহস্য" },
  { id: "romance", name: "Romance", name_bn: "রোমান্স" },
  { id: "comedy", name: "Comedy", name_bn: "কমেডি" },
];

export default async function GenresPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const params = await searchParams;
  const activeGenreName = params?.name || "Action";

  // Fetch real content from Supabase with safe fallbacks
  const [moviesRes, seriesRes] = await Promise.all([
    getPublicMovies({ genre: activeGenreName, limit: 18 }),
    getPublicSeries({ genre: activeGenreName, limit: 18 }),
  ]);

  const moviesList = moviesRes?.items || [];
  const seriesList = seriesRes?.items || [];
  let combinedItems = [...moviesList, ...seriesList];

  // Fallback to all content if empty for requested genre
  if (combinedItems.length === 0) {
    const [allMovies, allSeries] = await Promise.all([
      getPublicMovies({ limit: 12 }),
      getPublicSeries({ limit: 12 }),
    ]);
    combinedItems = [...(allMovies?.items || []), ...(allSeries?.items || [])];
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
            <Compass className="h-7 w-7 text-red-500" />
            <span>Browse Genres</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Explore Bengali & International movies and series organized by thematic genres
          </p>
        </div>

        {/* Genre Pill Selection */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {GENRE_LIST.map((g) => {
            const isActive = g.name.toLowerCase() === activeGenreName.toLowerCase();
            return (
              <Link
                key={g.id}
                href={`/genres?name=${encodeURIComponent(g.name)}`}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer shadow-lg ${
                  isActive
                    ? "bg-red-600 text-white border border-red-500"
                    : "bg-surface-raised border border-border text-text-secondary hover:text-text-primary hover:border-red-600/60"
                }`}
              >
                {g.name_bn || g.name}
              </Link>
            );
          })}
        </div>

        {/* Selected Genre Header & Results Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
            <span>{activeGenreName} Content</span>
            <span className="text-xs font-normal text-text-muted">({combinedItems.length} titles)</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {combinedItems.map((item) => (
              <PosterCard
                key={item.id}
                id={item.id}
                title={item.title}
                titleBn={item.title_bn}
                slug={item.slug}
                type={item.type}
                posterUrl={item.poster_url}
                releaseYear={item.release_year}
                rating={item.rating}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
