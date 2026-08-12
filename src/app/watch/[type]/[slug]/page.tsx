import { notFound } from "next/navigation";
import { getMovieBySlug } from "@/lib/content/movies";
import { getSeriesBySlug, getSeriesSeasonsAndEpisodes } from "@/lib/content/series";
import { getPlaybackSourcesForMovie, getPlaybackSourcesForEpisode, PlaybackSource } from "@/lib/playback/sources";
import { FlexPlayer } from "@/components/player/flex-player";
import { updateWatchProgressAction } from "@/features/user/lib/history";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  const { type, slug } = await params;

  let title = "Streaming Media";
  let contentId = "";
  let contentKind: "movie" | "episode" = "movie";
  let sources: PlaybackSource[] = [];

  if (type === "movie") {
    const movie = await getMovieBySlug(slug);
    if (!movie) notFound();
    title = movie.title;
    contentId = movie.id;
    contentKind = "movie";
    sources = await getPlaybackSourcesForMovie(movie.id);
  } else if (type === "series") {
    const series = await getSeriesBySlug(slug);
    if (!series) notFound();
    const { episodes } = await getSeriesSeasonsAndEpisodes(series.id);
    const targetEp = episodes[0];
    if (targetEp) {
      title = `${series.title} — Episode 1: ${targetEp.title}`;
      contentId = targetEp.id;
      contentKind = "episode";
      sources = await getPlaybackSourcesForEpisode(targetEp.id);
    } else {
      title = series.title;
      sources = await getPlaybackSourcesForMovie(series.id);
    }
  } else {
    notFound();
  }

  // Server Action handler wrapper for time updates
  const handlePositionUpdate = async (progressSeconds: number, durationSeconds: number) => {
    "use server";
    if (contentId) {
      await updateWatchProgressAction(contentId, contentKind, progressSeconds, durationSeconds);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex-1 flex flex-col justify-center items-center p-2 sm:p-6 max-w-7xl mx-auto w-full">
        <FlexPlayer
          title={title}
          sources={sources}
          autoPlay={true}
          onPositionUpdate={handlePositionUpdate}
        />
      </main>
    </div>
  );
}
