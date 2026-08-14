import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import {
  generateAIDescription,
  improveAIDescription,
  generateAISeoMetadata,
  suggestAIClassification,
  cleanAIText,
  translateAIText,
  generateAIEpisodeSummary,
  generateAISeasonSummary,
  enhanceAIText,
} from "@/lib/ai/operations";
import { AIRequestParams } from "@/types/ai";

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

    const params: AIRequestParams = await request.json();

    if (!params.title || !params.operation) {
      return NextResponse.json(
        { error: "Title and operation are required parameters." },
        { status: 400 }
      );
    }

    let result;
    switch (params.operation) {
      case "generate_description":
      case "localize_bengali":
        result = await generateAIDescription(params);
        break;
      case "improve_description":
        result = await improveAIDescription(params);
        break;
      case "generate_seo":
        result = await generateAISeoMetadata(params);
        break;
      case "suggest_classification":
        result = await suggestAIClassification(params);
        break;
      case "clean_content":
        result = await cleanAIText(params);
        break;
      case "translate":
        result = await translateAIText(params);
        break;
      case "generate_episode_summary":
        result = await generateAIEpisodeSummary(params);
        break;
      case "generate_season_summary":
        result = await generateAISeasonSummary(params);
        break;
      case "enhance_text":
        result = await enhanceAIText(params);
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported AI operation: ${params.operation}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Error in AI generate API route:", err);
    const msg = err instanceof Error ? err.message : "AI Service is temporarily unavailable.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
