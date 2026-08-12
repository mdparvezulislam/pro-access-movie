"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  Loader2,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { AIAssistantPanel } from "@/components/admin/ai/AIAssistantPanel";
import { SeasonEpisodeManager } from "./SeasonEpisodeManager";
import { toast } from "sonner";

interface SeriesEditorFormProps {
  id: string;
  initialData: {
    title: string;
    title_bn?: string | null;
    slug: string;
    status: string;
    release_year?: number | null;
    description?: string | null;
    description_bn?: string | null;
    rating?: number | null;
    content_rating?: string | null;
    media?: {
      posterUrl?: string;
      backdropUrl?: string;
      posterPath?: string;
      backdropPath?: string;
    } | null;
  };
}

export function SeriesEditorForm({ id, initialData }: SeriesEditorFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"metadata" | "seasons" | "ai">("metadata");
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState(initialData.title || "");
  const [titleBn, setTitleBn] = useState(initialData.title_bn || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [status, setStatus] = useState(initialData.status || "draft");
  const [releaseYear] = useState<number | string>(
    initialData.release_year || new Date().getFullYear()
  );
  const [description, setDescription] = useState(initialData.description || "");
  const [descriptionBn, setDescriptionBn] = useState(initialData.description_bn || "");
  const [rating] = useState<number | string>(initialData.rating || 8.0);
  const [contentRating, setContentRating] = useState(initialData.content_rating || "13+");

  const [posterUrl, setPosterUrl] = useState(
    initialData.media?.posterUrl || initialData.media?.posterPath || ""
  );
  const [backdropUrl, setBackdropUrl] = useState(
    initialData.media?.backdropUrl || initialData.media?.backdropPath || ""
  );

  const handleSave = async (publishImmediately: boolean = false) => {
    if (!title.trim()) {
      toast.error("Series title is required.");
      return;
    }

    setIsSaving(true);
    const targetStatus = publishImmediately ? "published" : status;

    try {
      const res = await fetch(`/api/admin/content/series/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          title_bn: titleBn.trim() || null,
          slug: slug.trim(),
          status: targetStatus,
          release_year: Number(releaseYear),
          description: description.trim() || null,
          description_bn: descriptionBn.trim() || null,
          rating: Number(rating),
          content_rating: contentRating,
          media: {
            posterUrl,
            backdropUrl,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save series changes.");
      }

      setStatus(targetStatus);
      toast.success(
        publishImmediately
          ? `Successfully published "${title}"!`
          : `Saved changes for "${title}".`
      );
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while saving.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-base border border-border shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/series")}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-text-primary">
                {title || "Untitled Series"}
              </h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                  status === "published"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-text-muted">TV Series Studio ID: {id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5 border-border"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Draft
          </Button>

          {status !== "published" && (
            <Button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              size="sm"
              variant="cinematic"
              className="h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-950/40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Publish to Platform
            </Button>
          )}
        </div>
      </div>

      {/* Editor Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("metadata")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "metadata"
              ? "bg-purple-600 text-white shadow-md"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
          }`}
        >
          <FileText className="h-4 w-4" /> Series Details & Media
        </button>

        <button
          onClick={() => setActiveTab("seasons")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "seasons"
              ? "bg-purple-600 text-white shadow-md"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
          }`}
        >
          <Layers className="h-4 w-4" /> Seasons & Episodes
        </button>

        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "ai"
              ? "bg-purple-600 text-white shadow-md"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
          }`}
        >
          <Sparkles className="h-4 w-4" /> OpenRouter AI Assistant
        </button>
      </div>

      {/* Tab 1: Metadata & Media */}
      {activeTab === "metadata" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-xl bg-surface-base border border-border space-y-4">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" />
                Series Overview
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">English Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Karagar"
                    className="h-9 text-xs bg-surface-raised border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">Bengali Title (বাংলা)</label>
                  <Input
                    value={titleBn}
                    onChange={(e) => setTitleBn(e.target.value)}
                    placeholder="e.g. কারাগার"
                    className="h-9 text-xs bg-surface-raised border-border font-bangla"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">URL Slug</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-9 text-xs bg-surface-raised border-border font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">English Synopsis</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-lg text-xs bg-surface-raised border border-border text-text-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">Bengali Synopsis (বাংলা)</label>
                <textarea
                  rows={4}
                  value={descriptionBn}
                  onChange={(e) => setDescriptionBn(e.target.value)}
                  className="w-full p-3 rounded-lg text-xs bg-surface-raised border border-border text-text-primary font-bangla focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-xl bg-surface-base border border-border space-y-4">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-purple-400" />
                Series Media Assets
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1.5">Poster Image</label>
                  <MediaPicker
                    value={posterUrl}
                    onChange={(url: string) => setPosterUrl(url)}
                    folder="series"
                    allowedTypes={["poster"]}
                    label="Select Poster Image"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1.5">Backdrop Image</label>
                  <MediaPicker
                    value={backdropUrl}
                    onChange={(url: string) => setBackdropUrl(url)}
                    folder="series"
                    allowedTypes={["backdrop"]}
                    label="Select Backdrop Image"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Seasons & Episodes Manager */}
      {activeTab === "seasons" && (
        <SeasonEpisodeManager seriesId={id} seriesTitle={title} />
      )}

      {/* Tab 3: OpenRouter AI Assistant */}
      {activeTab === "ai" && (
        <AIAssistantPanel
          title={title}
          releaseYear={Number(releaseYear)}
          existingDescription={description}
          existingDescriptionBn={descriptionBn}
          contentId={id}
          contentType="series"
          onApplyDescription={(descEn, descBn) => {
            if (descEn) setDescription(descEn);
            if (descBn) setDescriptionBn(descBn);
          }}
          onApplySeo={(seoTitle) => {
            toast.success(`Generated SEO Title: "${seoTitle}"`);
          }}
          onApplyClassification={(_, rating) => {
            if (rating) setContentRating(rating);
          }}
        />
      )}
    </div>
  );
}
