"use client";

import { useState } from "react";
import {
  Film,
  Tv,
  Radio,
  Sparkles,
  Settings,
  Plus,
  Layers,
  ShieldCheck,
  Wand2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Movie, Series } from "@/types/content";
import { MediaFileRecord } from "@/lib/media/storage";
import { generateMetadataAction } from "@/features/admin/lib/ai-actions";

interface AdminStudioViewProps {
  movies: Movie[];
  seriesList: Series[];
  mediaFiles: MediaFileRecord[];
}

export function AdminStudioView({ movies, seriesList, mediaFiles }: AdminStudioViewProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "ads" | "media" | "sources" | "ai" | "settings">("catalog");

  // AI Studio State
  const [aiTitle, setAiTitle] = useState("");
  const [aiResult, setAiResult] = useState<Record<string, string> | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGenerateMetadata = async () => {
    if (!aiTitle.trim()) return;
    setIsAiLoading(true);
    setAiError(null);
    setAiResult(null);

    const res = await generateMetadataAction(aiTitle.trim());
    setIsAiLoading(false);

    if (res.success && res.metadata) {
      setAiResult(res.metadata as unknown as Record<string, string>);
    } else {
      setAiError(res.error || "Failed to generate metadata via OpenRouter AI");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Studio Header & Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-text-primary tracking-tight">FLEX Admin Studio</h1>
            <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-[10px] font-bold text-red-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Super Admin
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Central management studio for content, media storage, playback mirrors, ad engine, and OpenRouter AI
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-surface-base p-1 rounded-xl border border-border overflow-x-auto no-scrollbar">
          {[
            { id: "catalog", label: "Catalog", icon: Film },
            { id: "ads", label: "Ad Manager", icon: Radio },
            { id: "media", label: "Media Storage", icon: Layers },
            { id: "sources", label: "Playback Mirrors", icon: Radio },
            { id: "ai", label: "AI Studio", icon: Sparkles },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "catalog" | "ads" | "media" | "sources" | "ai" | "settings")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-red-600 text-white shadow-md shadow-red-950/30"
                    : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: CATALOG MANAGEMENT */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Content Catalog ({movies.length} Movies, {seriesList.length} Series)</h2>
            <Button variant="cinematic" size="sm" className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              <span>Add New Content</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Movies List */}
            <Card className="bg-surface-base border-border">
              <CardHeader>
                <CardTitle className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Film className="h-5 w-5 text-red-500" />
                  <span>Movies ({movies.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {movies.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-text-primary">{m.title}</h4>
                      <p className="text-[11px] text-text-muted">{m.release_year} • {m.slug}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-[10px] font-bold text-emerald-400 uppercase">
                      {m.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Series List */}
            <Card className="bg-surface-base border-border">
              <CardHeader>
                <CardTitle className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Tv className="h-5 w-5 text-red-500" />
                  <span>TV & Web Series ({seriesList.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {seriesList.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-text-primary">{s.title}</h4>
                      <p className="text-[11px] text-text-muted">{s.release_year} • {s.slug}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-[10px] font-bold text-emerald-400 uppercase">
                      {s.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: AD MANAGER */}
      {activeTab === "ads" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Ad Engine Campaigns & Placements</h2>
            <Button variant="cinematic" size="sm" className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              <span>Create Campaign</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-surface-base border-border">
              <CardHeader>
                <CardTitle className="text-base font-bold text-text-primary">Active Placements</CardTitle>
                <CardDescription className="text-xs text-text-secondary">Configured ad placement slots across platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {[
                  { key: "home_hero_banner", type: "Banner", cap: "1 per session" },
                  { key: "rail_interstitial_card", type: "Card", cap: "2 per session" },
                  { key: "player_mid_roll", type: "Mid-Roll Video", cap: "1 per content" },
                ].map((p) => (
                  <div key={p.key} className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between">
                    <div>
                      <p className="font-bold text-text-primary">{p.key}</p>
                      <p className="text-text-muted text-[11px]">{p.type} • Frequency: {p.cap}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-[10px] font-bold text-emerald-400">
                      Active
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-surface-base border-border">
              <CardHeader>
                <CardTitle className="text-base font-bold text-text-primary">Smart Ad Gate Configuration</CardTitle>
                <CardDescription className="text-xs text-text-secondary">Player mid-roll lock settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border">
                  <span>Ad Gate Lock Duration</span>
                  <span className="font-bold text-red-500">8 seconds</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border">
                  <span>Skip Button State</span>
                  <span className="font-bold text-emerald-400">Enabled after timer</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border">
                  <span>Fallback Recovery</span>
                  <span className="font-bold text-emerald-400">Auto-unlock on load fail</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: MEDIA STORAGE */}
      {activeTab === "media" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Media Storage Buckets ({mediaFiles.length} Registered Files)</h2>
          </div>

          <Card className="bg-surface-base border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold text-text-primary">Upload Assets to Private Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader
                bucket="flex-posters"
                mediaType="poster"
                contentKind="movie"
                contentId="55555555-0000-0000-0000-000000000001"
                aspectRatio="poster"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: PLAYBACK MIRRORS */}
      {activeTab === "sources" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">CDN Playback Mirrors & Quality</h2>
          </div>

          <Card className="bg-surface-base border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold text-text-primary">Global CDN Provider Mirrors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-raised border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-text-primary">Primary Dhaka Edge CDN</h4>
                  <p className="text-text-muted text-[11px]">HLS Protocol • 1080p / 720p / 480p Adaptive</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-[10px] font-bold text-emerald-400">
                  Priority 1 (Default)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: AI STUDIO (OPENROUTER) */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-red-500" />
              <span>OpenRouter AI Content Studio</span>
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Automated English/Bengali synopsis generation, keywords extraction, and title duplicate detection
            </p>
          </div>

          <Card className="bg-surface-base border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold text-text-primary">Generate Metadata with AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Enter movie or show title (e.g., 'Karagar', 'Hawa')"
                  value={aiTitle}
                  onChange={(e) => setAiTitle(e.target.value)}
                  className="bg-surface-raised border-border text-xs"
                />
                <Button
                  variant="cinematic"
                  onClick={handleGenerateMetadata}
                  disabled={isAiLoading}
                  className="gap-2 text-xs shrink-0"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      <span>Run OpenRouter AI</span>
                    </>
                  )}
                </Button>
              </div>

              {aiError && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-300">
                  {aiError}
                </div>
              )}

              {aiResult && (
                <div className="p-4 rounded-2xl bg-surface-raised border border-border space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-red-400 uppercase">Bangla Title</span>
                    <p className="font-bold text-sm text-text-primary font-bengali">{aiResult.titleBn}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-red-400 uppercase">English Synopsis</span>
                    <p className="text-text-secondary mt-0.5">{aiResult.description}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-red-400 uppercase">Bengali Synopsis</span>
                    <p className="text-text-secondary mt-0.5 font-bengali">{aiResult.descriptionBn}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-red-400 uppercase">Search Keywords</span>
                    <p className="text-text-muted mt-0.5">{aiResult.searchKeywords}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-text-primary">FLEX Application Settings</h2>
          <Card className="bg-surface-base border-border">
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <p className="font-bold text-text-primary">Default Platform Language</p>
                  <p className="text-text-muted">Primary localization for UI strings</p>
                </div>
                <span className="font-bold text-red-500">Bengali (bn) / English (en)</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-text-primary">AI Gateway</p>
                  <p className="text-text-muted">Server-side LLM provider</p>
                </div>
                <span className="font-bold text-emerald-400">OpenRouter API</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
