"use client";

export interface SmartAdGateConfig {
  enabled: boolean;
  triggerTimeSeconds: number; // e.g. 15 seconds into video
  adDurationSeconds: number; // e.g. 10 seconds ad view time
  skipDelaySeconds: number; // e.g. 5 seconds before skip button enables
  maxGatesPerSession: number; // e.g. max 2 gates per video session
  minTimeBetweenGatesMinutes: number; // e.g. 10 minutes between gates
}

export const DEFAULT_AD_GATE_CONFIG: SmartAdGateConfig = {
  enabled: true,
  triggerTimeSeconds: 15,
  adDurationSeconds: 10,
  skipDelaySeconds: 5,
  maxGatesPerSession: 2,
  minTimeBetweenGatesMinutes: 10,
};

const GATE_SESSION_STORAGE_KEY = "flex_ad_gate_session_count";

/**
 * Gets session gate count from sessionStorage.
 */
export function getSessionGateCount(contentId: string): number {
  try {
    if (typeof window === "undefined") return 0;
    const raw = sessionStorage.getItem(`${GATE_SESSION_STORAGE_KEY}_${contentId}`);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Increments session gate count.
 */
export function recordAdGateShown(contentId: string): void {
  try {
    if (typeof window === "undefined") return;
    const count = getSessionGateCount(contentId);
    sessionStorage.setItem(`${GATE_SESSION_STORAGE_KEY}_${contentId}`, (count + 1).toString());
  } catch (err) {
    console.warn("[AdGate] Failed to record session gate count:", err);
  }
}

/**
 * Evaluates whether Smart Ad Gate should trigger for the given content and current time.
 */
export function canTriggerAdGate(
  contentId: string,
  currentTimeSeconds: number,
  config: SmartAdGateConfig = DEFAULT_AD_GATE_CONFIG
): boolean {
  if (!config.enabled) return false;

  const sessionCount = getSessionGateCount(contentId);
  if (sessionCount >= config.maxGatesPerSession) return false;

  // Trigger when playback reaches or passes triggerTimeSeconds
  return currentTimeSeconds >= config.triggerTimeSeconds && currentTimeSeconds < config.triggerTimeSeconds + 3;
}
