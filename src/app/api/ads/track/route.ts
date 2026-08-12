import { NextRequest, NextResponse } from "next/server";
import { evaluateAd, recordAdEventAction } from "@/lib/ads/ad-engine";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placementKey = searchParams.get("placement") || "home_hero_banner";

  try {
    const result = await evaluateAd(placementKey);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Ad evaluation error:", err);
    return NextResponse.json({ creative: null, placement: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placementKey, eventType, adId } = body;

    if (!placementKey || !eventType) {
      return NextResponse.json({ error: "placementKey and eventType required" }, { status: 400 });
    }

    await recordAdEventAction(placementKey, eventType, adId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Ad tracking event error:", err);
    return NextResponse.json({ success: false });
  }
}
