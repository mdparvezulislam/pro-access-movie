import { ChevronRight, Film } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentItem } from "@/types/content";

interface ContentRailProps {
  title: string;
  subtitle?: string;
  items?: ContentItem[];
}

export function ContentRail({ title, subtitle, items = [] }: ContentRailProps) {
  const hasItems = items.length > 0;

  return (
    <section className="space-y-3 py-4">
      {/* Rail Header */}
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <span>{title}</span>
            <ChevronRight className="h-4 w-4 text-text-muted hover:text-white cursor-pointer transition-colors" />
          </h2>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
        <span className="text-xs text-red-400 font-medium hover:underline cursor-pointer">
          See All
        </span>
      </div>

      {/* Horizontal Rail Grid / Scroll Container */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth">
        {hasItems
          ? items.map((item) => (
              <div
                key={item.id}
                className="group relative flex-none w-44 sm:w-52 rounded-xl overflow-hidden bg-card border border-border transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-950/20 cursor-pointer"
              >
                <div className="aspect-[2/3] w-full bg-surface-raised flex items-center justify-center text-text-muted">
                  {item.posterUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Film className="h-10 w-10 opacity-30" />
                  )}
                </div>
                <div className="p-3 bg-gradient-to-t from-black via-card to-transparent">
                  <h3 className="font-semibold text-sm text-text-primary truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    {item.releaseYear ?? "2026"} • {item.genres?.[0] || (item.type === "movie" ? "Movie" : "Series")}
                  </p>
                </div>
              </div>
            ))
          : Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex-none w-40 sm:w-48 space-y-2 rounded-xl overflow-hidden p-2 bg-surface-base border border-border-muted"
              >
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
      </div>
    </section>
  );
}
