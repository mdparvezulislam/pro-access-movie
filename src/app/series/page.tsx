import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { getPublishedSeries } from "@/lib/content/series";
import { Tv, Star } from "lucide-react";

export default async function SeriesPage() {
  const seriesList = await getPublishedSeries({ limit: 24 });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <Tv className="h-7 w-7 text-red-500" />
            <span>TV & Web Series</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Stream original Bengali drama series, multi-season web thrillers, and TV shows
          </p>
        </div>

        {/* Series Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {seriesList.map((s) => {
            const mediaObj = (s.media as Record<string, string>) || {};
            const posterUrl = mediaObj.posterUrl || null;
            return (
              <Link
                key={s.id}
                href={`/series/${s.slug}`}
                className="group relative rounded-xl overflow-hidden bg-card border border-border transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-950/20"
              >
                <div className="aspect-[2/3] w-full bg-surface-raised relative overflow-hidden">
                  {posterUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={posterUrl}
                      alt={s.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-text-muted">
                      <Tv className="h-10 w-10 opacity-30" />
                    </div>
                  )}

                  {s.rating && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{s.rating}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-surface-base">
                  <h3 className="font-bold text-sm text-text-primary truncate group-hover:text-red-500 transition-colors">
                    {s.title}
                  </h3>
                  {s.title_bn && (
                    <p className="text-xs text-text-muted truncate font-bengali">{s.title_bn}</p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-text-secondary mt-2 pt-2 border-t border-border-muted">
                    <span>{s.release_year ?? "2026"}</span>
                    <span className="text-red-400 font-semibold">Series</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
