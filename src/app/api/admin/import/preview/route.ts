import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { providerRegistry } from "@/lib/providers/provider-registry";
import { detectDuplicateContent } from "@/lib/content/duplicate-detector";
import { ProviderType } from "@/types/import";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { external_id, type, provider: providerId = "tmdb" } = body;

    if (!external_id || !type) {
      return NextResponse.json(
        { error: "external_id and type ('movie' | 'series') are required." },
        { status: 400 }
      );
    }

    const provider = providerRegistry.getProvider(providerId as ProviderType);

    if (type === "movie") {
      const movieDetails = await provider.getMovieDetails(external_id);
      const duplicateCheck = await detectDuplicateContent(
        "movie",
        movieDetails.title,
        movieDetails.release_year,
        movieDetails.external_ids
      );

      return NextResponse.json({
        type: "movie",
        details: movieDetails,
        duplicateCheck,
      });
    } else {
      const seriesDetails = await provider.getSeriesDetails(external_id);
      const duplicateCheck = await detectDuplicateContent(
        "series",
        seriesDetails.title,
        seriesDetails.release_year,
        seriesDetails.external_ids
      );

      return NextResponse.json({
        type: "series",
        details: seriesDetails,
        duplicateCheck,
      });
    }
  } catch (err: unknown) {
    console.error("Error in import preview API:", err);
    const msg = err instanceof Error ? err.message : "Failed to fetch metadata preview.";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
