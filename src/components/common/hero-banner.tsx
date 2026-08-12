import { Play, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <section className="relative w-full h-[60vh] min-h-[420px] max-h-[600px] overflow-hidden rounded-2xl bg-gradient-to-t from-background via-surface-raised to-surface-overlay border border-border-muted shadow-2xl flex items-end p-6 sm:p-10 lg:p-12 mb-10">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
      <div className="absolute top-0 right-0 w-2/3 h-full opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--accent),_transparent_70%)]" />

      {/* Hero content */}
      <div className="relative z-20 max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-red-400" />
          FLEX Spotlight Original
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Welcome to FLEX.
        </h1>

        <p className="text-sm sm:text-base text-text-secondary line-clamp-3 leading-relaxed">
          Stream premium Bengali originals, classic cinema, and worldwide blockbusters with lightning-fast playback and zero latency.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button variant="cinematic" size="lg" className="gap-2">
            <Play className="h-5 w-5 fill-current" />
            Watch Trailer
          </Button>
          <Button variant="outline" size="lg" className="gap-2 border-border-muted text-text-primary hover:bg-surface-hover">
            <Info className="h-5 w-5" />
            Details
          </Button>
        </div>
      </div>
    </section>
  );
}
