"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  CheckCircle2,
  Globe,
  Shield,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { AIAssistantPanel } from "@/components/admin/ai/AIAssistantPanel";
import { MediaSourceStudio } from "@/components/admin/sources/MediaSourceStudio";
import { toast } from "sonner";

interface ContentEditorFormProps {
  id: string;
  type: "movie" | "series";
  initialData: {
    title: string;
    title_bn?: string | null;
    slug: string;
    status: string;
    release_year?: number | null;
    duration_minutes?: number | null;
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

export function ContentEditorForm({ id, type, initialData }: ContentEditorFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState(initialData.title || "");
  const [titleBn, setTitleBn] = useState(initialData.title_bn || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [status, setStatus] = useState(initialData.status || "draft");
  const [releaseYear, setReleaseYear] = useState(initialData.release_year || new Date().getFullYear());
  const [durationMinutes, setDurationMinutes] = useState(initialData.duration_minutes || 120);
  const [rating, setRating] = useState(initialData.rating || 7.5);
  const [contentRating, setContentRating] = useState(initialData.content_rating || "13+");
  const [description, setDescription] = useState(initialData.description || "");
  const [descriptionBn, setDescriptionBn] = useState(initialData.description_bn || "");

  // Tab & Unsaved Changes State
  const [editorTab, setEditorTab] = useState<"overview" | "metadata" | "media" | "sources" | "publishing">("overview");
  const [isDirty, setIsDirty] = useState(false);

  // Media picker values
  const [posterPath, setPosterPath] = useState(initialData.media?.posterPath || initialData.media?.posterUrl || "");
  const [backdropPath, setBackdropPath] = useState(initialData.media?.backdropPath || initialData.media?.backdropUrl || "");

  const handleSave = async (publishImmediately: boolean = false) => {
    setIsSaving(true);
    const targetStatus = publishImmediately ? "published" : status;

    try {
      const res = await fetch(`/api/admin/content/${type}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          title_bn: titleBn || null,
          slug,
          status: targetStatus,
          release_year: Number(releaseYear),
          duration_minutes: Number(durationMinutes),
          rating: Number(rating),
          content_rating: contentRating,
          description,
          description_bn: descriptionBn || null,
          media: {
            posterUrl: posterPath,
            backdropUrl: backdropPath,
            posterPath,
            backdropPath,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update content record.");
      }

      setStatus(targetStatus);
      setIsDirty(false);
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-surface-base border border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-8 gap-1 text-xs border-border"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <div>
            <h2 className="text-base font-bold text-text-primary capitalize">
              Edit {type} — {title}
            </h2>
            <p className="text-xs text-text-muted">
              ID: <span className="font-mono">{id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaving ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </span>
          ) : isDirty ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1">
              Unsaved Changes
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Saved
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="h-9 text-xs gap-1.5 border-border"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Draft
          </Button>

          {status !== "published" && (
            <Button
              variant="cinematic"
              size="sm"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="h-9 text-xs gap-1.5"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Publish to Platform
            </Button>
          )}
        </div>
      </div>

      {/* Editor Tabs Navigation Header */}
      <div className="flex items-center gap-1 border-b border-border pb-3 overflow-x-auto">
        {[
          { id: "overview", label: "Overview & Text" },
          { id: "metadata", label: "Metadata & Specs" },
          { id: "media", label: "Media Assets" },
          { id: "sources", label: "Streaming & Downloads" },
          { id: "publishing", label: "Publishing Controls" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setEditorTab(tab.id as typeof editorTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              editorTab === tab.id
                ? "bg-red-600 text-white shadow-lg"
                : "bg-surface-base text-text-muted hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Metadata Forms */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Info */}
          <div className="p-6 rounded-xl bg-surface-base border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-500" />
                Primary Content Information
              </h3>
              <button
                type="button"
                onClick={async () => {
                  if (!title) return alert("Please enter a title first.");
                  try {
                    const res = await fetch("/api/admin/ai/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ title, overview: description, operation: "generate_description" }),
                    });
                    const data = await res.json();
                    if (res.ok && data.data) {
                      if (data.data.overviewEn && !description) setDescription(data.data.overviewEn);
                      if (data.data.overviewBn && !descriptionBn) setDescriptionBn(data.data.overviewBn);
                      if (data.data.titleBn && !titleBn) setTitleBn(data.data.titleBn);
                    }
                  } catch (err) {
                    console.error("AI error:", err);
                  }
                }}
                className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-500/20 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" /> AI Enrich Metadata
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">Title (English)</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9 text-xs bg-surface-raised border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">Title (Bengali / বাংলা)</label>
                <Input
                  value={titleBn}
                  onChange={(e) => setTitleBn(e.target.value)}
                  placeholder="বাংলা নাম..."
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
              <label className="text-xs font-medium text-text-secondary">English Description / Overview</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-lg text-xs bg-surface-raised border border-border text-text-primary focus:outline-none focus:border-red-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Bengali Description / বিস্তারিত (বাংলা)</label>
              <textarea
                rows={4}
                value={descriptionBn}
                onChange={(e) => setDescriptionBn(e.target.value)}
                placeholder="বাংলা বিবরণ..."
                className="w-full p-3 rounded-lg text-xs bg-surface-raised border border-border text-text-primary focus:outline-none focus:border-red-500/50 font-bangla"
              />
            </div>
          </div>

          {/* Details & Specifications */}
          <div className="p-6 rounded-xl bg-surface-base border border-border space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <Globe className="h-4 w-4 text-red-500" />
              Specifications & Classification
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">Release Year</label>
                <Input
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(Number(e.target.value))}
                  className="h-9 text-xs bg-surface-raised border-border font-mono"
                />
              </div>

              {type === "movie" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">Runtime (Mins)</label>
                  <Input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="h-9 text-xs bg-surface-raised border-border font-mono"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">Rating (0-10)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="h-9 text-xs bg-surface-raised border-border font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">Age Rating</label>
                <select
                  value={contentRating}
                  onChange={(e) => setContentRating(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text-primary"
                >
                  <option value="G">G (General)</option>
                  <option value="PG">PG (Parental)</option>
                  <option value="13+">13+ (Teen)</option>
                  <option value="16+">16+ (Mature)</option>
                  <option value="18+">18+ (Adult)</option>
                </select>
              </div>
            </div>
          </div>

          {/* OpenRouter AI Assistant */}
          <AIAssistantPanel
            title={title}
            releaseYear={Number(releaseYear)}
            existingDescription={description}
            existingDescriptionBn={descriptionBn}
            contentId={id}
            contentType={type}
            onApplyDescription={(descEn, descBn) => {
              if (descEn) setDescription(descEn);
              if (descBn) setDescriptionBn(descBn);
            }}
            onApplySeo={(seoTitle, _seoDesc) => {
              toast.success(`Generated SEO Title: "${seoTitle}"`);
            }}
            onApplyClassification={(genres, rating) => {
              if (rating) setContentRating(rating);
            }}
          />

          {/* Unified Media Sources Studio */}
          {type === "movie" && (
            <div className="pt-4">
              <MediaSourceStudio contentType="movie" contentId={id} />
            </div>
          )}
        </div>

        {/* Right Column: Status & Media Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Settings */}
          <div className="p-6 rounded-xl bg-surface-base border border-border space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-500" />
              Publishing Controls
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary">Catalog Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-lg text-xs font-bold bg-surface-raised border border-border text-text-primary"
              >
                <option value="draft">Draft (Private Admin Only)</option>
                <option value="review">Review (Pending Approval)</option>
                <option value="published">Published (Live Public Catalog)</option>
                <option value="archived">Archived (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Phase 03 Media Integration */}
          <div className="p-6 rounded-xl bg-surface-base border border-border space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-red-500" />
              Media Assets (Phase 03 DAM)
            </h3>

            <div className="space-y-4">
              <MediaPicker
                label="Poster Image"
                value={posterPath}
                onChange={(path) => setPosterPath(path)}
                aspectRatio="poster"
                folder={type}
              />

              <MediaPicker
                label="Backdrop Image"
                value={backdropPath}
                onChange={(path) => setBackdropPath(path)}
                aspectRatio="backdrop"
                folder={type}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
