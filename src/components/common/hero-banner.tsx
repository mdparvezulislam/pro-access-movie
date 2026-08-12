import Link from "next/link";
import { Play, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HeroItem {
  id: string;
  title: string;
  titleBn?: string;
  slug: string;
  type: "movie" | "series";
  description?: string;
  releaseYear?: number;
  durationMinutes?: number;
  rating?: number;
  backdropUrl?: string | null;
  posterUrl?: string | null;
}

interface HeroBannerProps {
  item?: HeroItem;
}

export function HeroBanner({ item }: HeroBannerProps) {
  const title = item?.title || "Welcome to FLEX.";
  const titleBn = item?.titleBn;
  const description = item?.description || "Stream premium Bengali originals, classic cinema, and worldwide blockbusters with lightning-fast playback.";
  const backdropUrl = item?.backdropUrl || null;
  const watchLink = item ? `/watch/${item.type}/${item.slug}` : "/login";
  const detailsLink = item ? `/${item.type === "movie" ? "movies" : "series"}/${item.slug}` : "/movies";

  return (
    <section className="relative w-full h-[60vh] min-h-[420px] max-h-[600px] overflow-hidden rounded-2xl bg-gradient-to-t from-background via-surface-raised to-surface-overlay border border-border-muted shadow-2xl flex items-end p-6 sm:p-10 lg:p-12 mb-10 group">
      {/* Artwork backdrop */}
      {backdropUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={backdropUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
        />
      )}

      {/* Ambient gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10" />

      {/* Hero content */}
      <div className="relative z-20 max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-red-400" />
          <span>FLEX Spotlight Original</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          {title}
        </h1>
        {titleBn && (
          <h2 className="text-lg font-bold text-red-400 font-bengali">{titleBn}</h2>
        )}

        <p className="text-sm sm:text-base text-text-secondary line-clamp-3 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link href={watchLink}>
            <Button variant="cinematic" size="lg" className="gap-2 shadow-xl shadow-red-950/40">
              <Play className="h-5 w-5 fill-current" />
              <span>Watch Now</span>
            </Button>
          </Link>
          <Link href={detailsLink}>
            <Button variant="outline" size="lg" className="gap-2 border-border-muted text-text-primary hover:bg-surface-hover">
              <Info className="h-5 w-5" />
              <span>Details</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
