import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { getUserWatchHistory, clearWatchHistoryAction } from "@/features/user/lib/history";
import { Clock, Play, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const historyItems = await getUserWatchHistory();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
              <Clock className="h-7 w-7 text-red-500" />
              <span>Watch History</span>
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Resume playback from where you stopped across devices
            </p>
          </div>

          {historyItems.length > 0 && (
            <form action={async () => { "use server"; await clearWatchHistoryAction(); }}>
              <Button variant="outline" size="sm" type="submit" className="gap-2 text-xs border-border text-red-400 hover:text-red-300">
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear History</span>
              </Button>
            </form>
          )}
        </div>

        {historyItems.length > 0 ? (
          <div className="space-y-3">
            {historyItems.map((item) => {
              const progressPercent = item.durationSeconds > 0
                ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100))
                : 0;

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-surface-base border border-border hover:bg-surface-raised transition-all gap-4 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-24 sm:w-32 aspect-video rounded-lg overflow-hidden bg-surface-raised relative shrink-0">
                      {item.posterUrl || item.backdropUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.backdropUrl || item.posterUrl || ""}
                          alt={item.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-text-muted">
                          <Play className="h-6 w-6" />
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
                        <div
                          className="h-full bg-red-600"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-text-primary group-hover:text-red-500 transition-colors">
                        {item.title}
                      </h3>
                      {item.titleBn && (
                        <p className="text-xs text-text-muted font-bengali">{item.titleBn}</p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-text-secondary mt-1">
                        <span>{progressPercent}% completed</span>
                        {item.completed && (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Watched
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link href={`/watch/${item.type}/${item.slug}`}>
                    <Button variant="cinematic" size="sm" className="gap-2 text-xs shrink-0">
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{item.completed ? "Re-watch" : "Resume"}</span>
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-surface-base border border-border-muted space-y-3">
            <Clock className="h-12 w-12 text-text-muted mx-auto" />
            <h3 className="text-lg font-bold text-text-primary">No watch history yet</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Start streaming movies and series to automatically track your watch progress.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
