"use client";

import React, { useState, useEffect } from "react";
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
  Video,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertTriangle,
  Play,
  Tv,
  User,
  Users,
  Sparkles,
  Layers,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { AIAssistantPanel } from "@/components/admin/ai/AIAssistantPanel";
import { TaxonomySelector } from "../content/TaxonomySelector";
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
    tagline?: string | null;
    director?: string | null;
    cast?: string | null;
    trailer_url?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
    seo_keywords?: string | null;
    search_keywords?: string | null;
    rating?: number | null;
    content_rating?: string | null;
    category_ids?: string[];
    genre_ids?: string[];
    collection_ids?: string[];
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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Core Metadata State
  const [title, setTitle] = useState(initialData.title || "");
  const [titleBn, setTitleBn] = useState(initialData.title_bn || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [status, setStatus] = useState(initialData.status || "draft");
  const [releaseYear, setReleaseYear] = useState(initialData.release_year || new Date().getFullYear());
  const [rating, setRating] = useState(initialData.rating || 8.0);
  const [contentRating, setContentRating] = useState(initialData.content_rating || "13+");
  const [description, setDescription] = useState(initialData.description || "");
  const [descriptionBn, setDescriptionBn] = useState(initialData.description_bn || "");
  const [tagline, setTagline] = useState(initialData.tagline || "");
  const [director, setDirector] = useState(initialData.director || "");
  const [cast, setCast] = useState(initialData.cast || "");
  const [trailerUrl, setTrailerUrl] = useState(initialData.trailer_url || "");

  // Taxonomy State
  const [categoryIds, setCategoryIds] = useState<string[]>(initialData.category_ids || []);
  const [genreIds, setGenreIds] = useState<string[]>(initialData.genre_ids || []);
  const [collectionIds, setCollectionIds] = useState<string[]>(initialData.collection_ids || []);

  // SEO State
  const [seoTitle, setSeoTitle] = useState(initialData.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(initialData.seo_description || "");
  const [seoKeywords, setSeoKeywords] = useState(initialData.seo_keywords || "");
  const [searchKeywords, setSearchKeywords] = useState(initialData.search_keywords || "");
  const [isSeoOpen, setIsSeoOpen] = useState(false);

  // 5 Primary Sections: content | media | seasons | discovery | publish
  const [activeTab, setActiveTab] = useState<"content" | "media" | "seasons" | "discovery" | "publish">("content");
  const [isDirty, setIsDirty] = useState(false);

  // Media state
  const [posterPath, setPosterPath] = useState(initialData.media?.posterPath || initialData.media?.posterUrl || "");
  const [backdropPath, setBackdropPath] = useState(initialData.media?.backdropPath || initialData.media?.backdropUrl || "");

  // Load existing taxonomies on mount
  useEffect(() => {
    async function loadTaxonomies() {
      try {
        const res = await fetch(`/api/admin/content/series/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            if (Array.isArray(json.data.category_ids)) setCategoryIds(json.data.category_ids);
            if (Array.isArray(json.data.genre_ids)) setGenreIds(json.data.genre_ids);
            if (Array.isArray(json.data.collection_ids)) setCollectionIds(json.data.collection_ids);
          }
        }
      } catch (err) {
        console.error("Failed to load series taxonomy relationships:", err);
      }
    }
    loadTaxonomies();
  }, [id]);

  // Unsaved Changes Navigation Warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Save Series Handler
  const handleSave = async (targetStatus?: string) => {
    if (isSaving) return;
    setIsSaving(true);
    const finalStatus = targetStatus || status;

    try {
      const res = await fetch(`/api/admin/content/series/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          title_bn: titleBn || null,
          slug,
          status: finalStatus,
          release_year: Number(releaseYear),
          rating: Number(rating),
          content_rating: contentRating,
          description,
          description_bn: descriptionBn || null,
          tagline: tagline || null,
          director: director || null,
          cast: cast || null,
          trailer_url: trailerUrl || null,
          seo_title: seoTitle || null,
          seo_description: seoDescription || null,
          seo_keywords: seoKeywords || null,
          search_keywords: searchKeywords || null,
          category_ids: categoryIds,
          genre_ids: genreIds,
          collection_ids: collectionIds,
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
        throw new Error(data.error || "Failed to update series record.");
      }

      setStatus(finalStatus);
      setIsDirty(false);
      toast.success(
        finalStatus === "published"
          ? `Successfully published TV Series "${title}"!`
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

  // Delete Series Handler
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/content/series/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete series.");
      }

      toast.success(`Deleted TV Series "${title}" successfully.`);
      router.push("/admin/series");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not delete series.";
      toast.error(msg);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-24">
      {/* 1. UNIFIED EDITOR HEADER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-base border border-border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/series")}
            className="h-9 px-3 gap-1.5 text-text-muted hover:text-text-primary border border-border shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          {/* Poster Thumbnail */}
          <div className="h-16 w-12 rounded-lg bg-surface-raised border border-border/80 overflow-hidden shrink-0 flex items-center justify-center">
            {posterPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterPath}
                alt={title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <Tv className="h-6 w-6 text-text-muted" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-extrabold text-text-primary truncate">
                {title || "Untitled TV Series"}
              </h1>
              {titleBn && (
                <span className="text-xs font-bangla text-purple-300 font-semibold">
                  ({titleBn})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
              <span className="capitalize font-bold text-purple-400">TV Series</span>
              <span>•</span>
              <span>{releaseYear || 2024}</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">⭐ {rating}/10</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Status */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
              status === "published"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : status === "archived"
                ? "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                status === "published" ? "bg-emerald-400 animate-pulse" : "bg-purple-400"
              }`}
            />
            {status}
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="h-9 text-xs border-border"
            >
              Save Draft
            </Button>
            <Button
              type="button"
              variant="cinematic"
              size="sm"
              onClick={() => handleSave("published")}
              disabled={isSaving}
              className="h-9 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              <span>Publish</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY TAB NAVIGATION */}
      <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-surface-base border border-border overflow-x-auto shadow-md">
        {[
          { id: "content", label: "CONTENT", icon: FileText },
          { id: "media", label: "MEDIA", icon: ImageIcon },
          { id: "seasons", label: "SEASONS & EPISODES", icon: Layers },
          { id: "discovery", label: "DISCOVERY", icon: Globe },
          { id: "publish", label: "PUBLISH", icon: Shield },
        ].map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
              }`}
            >
              <IconComp className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CONTENT */}
      {activeTab === "content" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-4 shadow-xl">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" /> Series Metadata
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Series Title (English) *</label>
                  <Input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setIsDirty(true);
                    }}
                    required
                    className="h-10 text-xs bg-surface-raised border-border font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Bengali Title (বাংলা)</label>
                  <Input
                    value={titleBn}
                    onChange={(e) => {
                      setTitleBn(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. কালবেলা"
                    className="h-10 text-xs bg-surface-raised border-border font-bangla"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Slug *</label>
                  <Input
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsDirty(true);
                    }}
                    required
                    className="h-10 text-xs bg-surface-raised border-border font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Tagline</label>
                  <Input
                    value={tagline}
                    onChange={(e) => {
                      setTagline(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Series tagline or teaser sentence..."
                    className="h-10 text-xs bg-surface-raised border-border"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Series Synopsis (English)</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full p-3 rounded-xl bg-surface-raised border border-border text-xs text-text-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Bengali Synopsis (বাংলা)</label>
                <textarea
                  rows={4}
                  value={descriptionBn}
                  onChange={(e) => {
                    setDescriptionBn(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full p-3 rounded-xl bg-surface-raised border border-border text-xs text-text-primary font-bangla focus:outline-none"
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-4 shadow-xl">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <User className="h-4 w-4 text-purple-400" /> Directors & Cast
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Director(s)</label>
                  <Input
                    value={director}
                    onChange={(e) => {
                      setDirector(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. Ashfaque Nipun"
                    className="h-10 text-xs bg-surface-raised border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Cast / Actors</label>
                  <Input
                    value={cast}
                    onChange={(e) => {
                      setCast(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. Afran Nisho, Mehazabien Chowdhury"
                    className="h-10 text-xs bg-surface-raised border-border"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-4 shadow-xl">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Sliders className="h-4 w-4 text-purple-400" /> Series Properties
              </h2>
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">First Release Year</label>
                  <Input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => {
                      setReleaseYear(Number(e.target.value));
                      setIsDirty(true);
                    }}
                    className="h-10 text-xs bg-surface-raised border-border font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-text-secondary">Rating (0 - 10)</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={rating}
                      onChange={(e) => {
                        setRating(Number(e.target.value));
                        setIsDirty(true);
                      }}
                      className="h-10 text-xs bg-surface-raised border-border font-mono font-bold text-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-text-secondary">Content Rating</label>
                    <select
                      value={contentRating}
                      onChange={(e) => {
                        setContentRating(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-bold"
                    >
                      <option value="ALL">ALL (G)</option>
                      <option value="13+">13+ (PG-13)</option>
                      <option value="16+">16+</option>
                      <option value="18+">18+ (Restricted)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Trailer Video URL</label>
                  <Input
                    value={trailerUrl}
                    onChange={(e) => {
                      setTrailerUrl(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="h-10 text-xs bg-surface-raised border-border font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-base border border-purple-500/20 shadow-xl">
              <AIAssistantPanel
                title={title}
                contentType="series"
                contentId={id}
                existingDescription={description}
                onApplyDescription={(descEn, descBn, tag) => {
                  if (descEn) setDescription(descEn);
                  if (descBn) setDescriptionBn(descBn);
                  if (tag) setTagline(tag);
                  setIsDirty(true);
                }}
                onApplySeo={(st, sd, kw) => {
                  if (st) setSeoTitle(st);
                  if (sd) setSeoDescription(sd);
                  if (kw && kw.length > 0) setSeoKeywords(kw.join(", "));
                  setIsDirty(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEDIA */}
      {activeTab === "media" && (
        <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-6 shadow-xl">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-purple-400" /> Series Media Assets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MediaPicker
              label="Series Poster Image (2:3)"
              value={posterPath}
              onChange={(url) => {
                setPosterPath(url);
                setIsDirty(true);
              }}
              aspectRatio="poster"
              folder="series"
            />
            <MediaPicker
              label="Series Backdrop Image (16:9)"
              value={backdropPath}
              onChange={(url) => {
                setBackdropPath(url);
                setIsDirty(true);
              }}
              aspectRatio="backdrop"
              folder="series"
            />
          </div>
        </div>
      )}

      {/* TAB 3: SEASONS & EPISODES */}
      {activeTab === "seasons" && (
        <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-6 shadow-xl">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-400" /> Season & Episode Workspace
          </h2>
          <SeasonEpisodeManager seriesId={id} seriesTitle={title} />
        </div>
      )}

      {/* TAB 4: DISCOVERY */}
      {activeTab === "discovery" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-6 shadow-xl">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" /> Series Taxonomies & Collections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TaxonomySelector
                label="Genres"
                icon="tag"
                type="genres"
                selectedIds={genreIds}
                onChange={(ids) => {
                  setGenreIds(ids);
                  setIsDirty(true);
                }}
              />
              <TaxonomySelector
                label="Categories"
                icon="folder"
                type="categories"
                selectedIds={categoryIds}
                onChange={(ids) => {
                  setCategoryIds(ids);
                  setIsDirty(true);
                }}
              />
              <TaxonomySelector
                label="Collections"
                icon="bookmark"
                type="collections"
                selectedIds={collectionIds}
                onChange={(ids) => {
                  setCollectionIds(ids);
                  setIsDirty(true);
                }}
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-4 shadow-xl">
            <button
              type="button"
              onClick={() => setIsSeoOpen(!isSeoOpen)}
              className="w-full flex items-center justify-between text-sm font-bold text-text-primary"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-400" />
                <span>Series SEO & Search Keywords</span>
              </div>
              {isSeoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {isSeoOpen && (
              <div className="space-y-4 pt-4 border-t border-border text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Custom SEO Title</label>
                  <Input
                    value={seoTitle}
                    onChange={(e) => {
                      setSeoTitle(e.target.value);
                      setIsDirty(true);
                    }}
                    className="h-10 text-xs bg-surface-raised border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Meta Description</label>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => {
                      setSeoDescription(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full p-3 rounded-xl bg-surface-raised border border-border text-xs text-text-primary focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: PUBLISH */}
      {activeTab === "publish" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" /> Series Publishing Controls
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary">Current Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-xs font-bold text-text-primary"
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published (Live)</option>
                <option value="archived">Archived (Unlisted)</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSave("draft")}
                disabled={isSaving}
                className="h-10 text-xs border-border"
              >
                Save Draft
              </Button>
              <Button
                type="button"
                variant="cinematic"
                onClick={() => handleSave("published")}
                disabled={isSaving}
                className="h-10 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Publish Series
              </Button>
              <a
                href={`/series/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-surface-raised hover:bg-surface-base border border-border text-xs font-bold text-text-primary inline-flex items-center gap-1.5 transition"
              >
                <span>Preview Public Page</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface-base border border-red-500/30 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Danger Zone
            </h3>
            <p className="text-xs text-text-muted">
              Deleting this series will also remove associated seasons and episode playback links.
            </p>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
              className="h-9 text-xs gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> Delete TV Series
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-red-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-extrabold text-text-primary">
                Delete Series &quot;{title}&quot;?
              </h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              This action cannot be undone. All seasons and episodes under this series will be permanently deleted.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="h-9 text-xs">
                Cancel
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} className="h-9 text-xs gap-1.5">
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirm Delete Series
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
