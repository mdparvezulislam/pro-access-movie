import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { providerRegistry } from "@/lib/providers/provider-registry";
import { ProviderType, ContentType } from "@/types/import";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = (searchParams.get("type") as ContentType | "all") || "all";
    const providerId = (searchParams.get("provider") as ProviderType) || "tmdb";

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const provider = providerRegistry.getProvider(providerId);
    const results = await provider.search(query.trim(), type);

    return NextResponse.json({
      results,
      provider: {
        id: provider.id,
        name: provider.name,
        isConfigured: provider.isConfigured(),
      },
    });
  } catch (err: unknown) {
    console.error("Error in import search API:", err);
    const msg = err instanceof Error ? err.message : "Failed to search metadata provider.";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
