import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { EmptyState } from "@/components/common/empty-state";
import { PosterCard } from "@/components/cards/poster-card";
import { getUserWatchlist } from "@/features/user/lib/watchlist";
import { DEMO_MOVIES } from "@/lib/content/catalog-fallback";
import { Bookmark } from "lucide-react";

export const metadata = {
  title: "My List — PRO ACCESS MOVIE",
  description: "Your saved movies and series library on PRO ACCESS MOVIE.",
};

export default async function MyListPage() {
  const watchlist = await getUserWatchlist();
  const displayItems = watchlist.length > 0 ? watchlist : DEMO_MOVIES.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
            <Bookmark className="h-7 w-7 text-red-500" />
            <span>My List</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Your personal collection of saved movies and series
          </p>
        </div>

        {displayItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayItems.map((item: any) => (
              <PosterCard
                key={item.id}
                id={item.id}
                title={item.title}
                titleBn={item.titleBn || item.title_bn}
                slug={item.slug}
                type={item.type || "movie"}
                posterUrl={item.posterUrl}
                releaseYear={item.releaseYear || item.release_year}
                rating={item.rating}
                badgeText="SAVED"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your List is Empty"
            description="Save your favorite movies and TV shows to watch them later anytime."
            icon={<Bookmark className="h-10 w-10 text-red-500" />}
            actionLabel="Discover Content"
            actionHref="/"
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
