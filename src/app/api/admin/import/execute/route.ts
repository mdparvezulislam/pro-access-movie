import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { providerRegistry } from "@/lib/providers/provider-registry";
import { importMovie, importSeries } from "@/lib/content/import-service";
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
    const {
      external_id,
      type,
      provider: providerId = "tmdb",
      overrideDuplicates = false,
      downloadMedia = true,
    } = body;

    if (!external_id || !type) {
      return NextResponse.json(
        { error: "external_id and type are required." },
        { status: 400 }
      );
    }

    const provider = providerRegistry.getProvider(providerId as ProviderType);

    if (type === "movie") {
      const movieDetails = await provider.getMovieDetails(external_id);
      const result = await importMovie(movieDetails, {
        overrideDuplicates,
        downloadMedia,
        targetStatus: "draft",
        assignedBy: user.id,
      });

      return NextResponse.json(result);
    } else {
      const seriesDetails = await provider.getSeriesDetails(external_id);
      const result = await importSeries(seriesDetails, {
        overrideDuplicates,
        downloadMedia,
        targetStatus: "draft",
        assignedBy: user.id,
      });

      return NextResponse.json(result);
    }
  } catch (err: unknown) {
    console.error("Error executing import API:", err);
    const msg = err instanceof Error ? err.message : "Failed to execute content import.";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
