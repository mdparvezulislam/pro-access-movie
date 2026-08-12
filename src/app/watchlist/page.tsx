import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { getUserWatchlist } from "@/features/user/lib/watchlist";
import { Bookmark, Film, Star } from "lucide-react";

export default async function WatchlistPage() {
  const items = await getUserWatchlist();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
              <Bookmark className="h-7 w-7 text-red-500" />
              <span>My Saved List</span>
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Your personal library of saved movies and TV shows
            </p>
          </div>
          <span className="text-xs text-text-muted">{items.length} saved titles</span>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl overflow-hidden bg-card border border-border flex flex-col"
              >
                <Link
                  href={`/${item.type === "movie" ? "movies" : "series"}/${item.slug}`}
                  className="aspect-[2/3] w-full bg-surface-raised relative overflow-hidden block"
                >
                  {item.posterUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-text-muted">
                      <Film className="h-10 w-10 opacity-30" />
                    </div>
                  )}

                  {item.rating && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                    </div>
                  )}
                </Link>

                <div className="p-3 bg-surface-base flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-text-primary truncate">{item.title}</h3>
                    {item.titleBn && (
                      <p className="text-xs text-text-muted truncate font-bengali">{item.titleBn}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-text-secondary mt-3 pt-2 border-t border-border-muted">
                    <span>{item.releaseYear ?? "2026"}</span>
                    <span className="text-red-400 font-semibold uppercase">{item.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-surface-base border border-border-muted space-y-3">
            <Bookmark className="h-12 w-12 text-text-muted mx-auto" />
            <h3 className="text-lg font-bold text-text-primary">Your list is empty</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Save your favorite movies and series by clicking &quot;Add to List&quot; on any title detail page.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
