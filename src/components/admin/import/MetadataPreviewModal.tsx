"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Film,
  Tv,
  Star,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Download,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NormalizedMovieData,
  NormalizedSeriesData,
  DuplicateCheckResult,
  ImportResult,
} from "@/types/import";
import { toast } from "sonner";

interface MetadataPreviewModalProps {
  open: boolean;
  onClose: () => void;
  type: "movie" | "series";
  details: NormalizedMovieData | NormalizedSeriesData | null;
  duplicateCheck: DuplicateCheckResult | null;
  providerId: string;
  externalId: string;
  onSuccess?: (result: ImportResult) => void;
}

export function MetadataPreviewModal({
  open,
  onClose,
  type,
  details,
  duplicateCheck,
  providerId,
  externalId,
  onSuccess,
}: MetadataPreviewModalProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  if (!open || !details) return null;

  const movie = type === "movie" ? (details as NormalizedMovieData) : null;
  const series = type === "series" ? (details as NormalizedSeriesData) : null;

  const title = details.title;
  const titleBn = details.title_bn;
  const originalTitle = details.original_title;
  const overview = details.overview;
  const releaseYear = details.release_year;
  const rating = details.rating;
  const posterUrl = details.poster_url || "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600";
  const backdropUrl = details.backdrop_url;
  const genres = details.genres || [];

  const handleExecuteImport = async (override: boolean = false) => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const res = await fetch("/api/admin/import/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: providerId,
          external_id: externalId,
          type,
          overrideDuplicates: override,
          downloadMedia: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to import content.");
      }

      setImportResult(data);
      toast.success(data.message || `Successfully imported "${title}" as Draft.`);
      if (onSuccess) onSuccess(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during import.";
      toast.error(msg);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-surface-base border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-raised/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/10 text-red-500 font-bold border border-red-500/20">
              {type === "movie" ? <Film className="h-4 w-4" /> : <Tv className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Import Preview — <span className="capitalize">{type}</span>
              </h3>
              <p className="text-xs text-text-muted">
                Review normalized metadata before saving to catalog as Draft.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Duplicate Warning Banner */}
          {duplicateCheck?.isDuplicate && !importResult && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs space-y-1">
                <p className="font-bold text-amber-300 text-sm">
                  Duplicate Record Detected!
                </p>
                <p>{duplicateCheck.reason}</p>
                <p className="text-[11px] text-amber-400/80">
                  You can update the existing record with refreshed metadata or overwrite duplicate entries.
                </p>
              </div>
            </div>
          )}

          {/* Import Execution Progress Indicator */}
          {isImporting && (
            <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                <span>Importing & Ingesting Media...</span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px] text-text-muted">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Provider metadata fetched ({providerId.toUpperCase()})</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Duplicate detection check passed</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Ingesting poster & backdrop to Supabase Storage...</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted/60">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Creating draft content & linking genres</span>
                </div>
              </div>
            </div>
          )}

          {/* Success & Warnings Banner */}
          {importResult?.success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs space-y-2">
                <p className="font-bold text-emerald-300 text-sm">
                  Import Successful!
                </p>
                <p>{importResult.message}</p>

                {importResult.warnings && importResult.warnings.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1 text-amber-300 text-[11px]">
                    <p className="font-bold flex items-center gap-1 text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Import Warnings / Safe Fallbacks:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {importResult.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <Link href={type === "movie" ? `/admin/movies` : `/admin/series`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-emerald-500/40 text-emerald-300">
                      <Edit className="h-3.5 w-3.5" />
                      Open Content Studio
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Hero Banner & Thumbnail */}
          <div className="relative rounded-xl overflow-hidden bg-surface-raised border border-border">
            {backdropUrl ? (
              <div className="relative h-48 sm:h-64 w-full">
                <Image
                  src={backdropUrl}
                  alt={title}
                  fill
                  className="object-cover opacity-40"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/60 to-transparent" />
              </div>
            ) : (
              <div className="h-32 bg-surface-raised" />
            )}

            <div className="p-6 flex flex-col sm:flex-row gap-6 -mt-16 sm:-mt-24 relative z-10">
              <div className="relative h-40 w-28 sm:h-52 sm:w-36 rounded-lg overflow-hidden border-2 border-border shadow-xl shrink-0 bg-surface-base">
                <Image
                  src={posterUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary">
                    {title} {titleBn && <span className="text-red-400 font-normal text-lg sm:text-xl">({titleBn})</span>}
                  </h2>
                  {originalTitle && originalTitle !== title && (
                    <p className="text-xs text-text-muted italic">
                      Original title: {originalTitle}
                    </p>
                  )}
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-text-secondary">
                  {releaseYear && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-raised border border-border">
                      <Calendar className="h-3.5 w-3.5 text-text-muted" />
                      {releaseYear}
                    </span>
                  )}
                  {movie?.duration_minutes && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-raised border border-border">
                      <Clock className="h-3.5 w-3.5 text-text-muted" />
                      {movie.duration_minutes} min
                    </span>
                  )}
                  {rating && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {rating} / 10
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-md bg-red-600/10 text-red-400 border border-red-500/20 uppercase text-[10px]">
                    Draft Mode
                  </span>
                </div>

                {/* Genre Tags */}
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {genres.map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-surface-raised text-text-muted border border-border"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Overview</h4>
            <p className="text-sm text-text-secondary leading-relaxed bg-surface-raised/40 p-4 rounded-xl border border-border/50">
              {overview || "No description provided."}
            </p>
          </div>

          {/* Series Seasons Preview */}
          {series && series.seasons && series.seasons.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Seasons & Episodes ({series.seasons.length} Seasons)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {series.seasons.map((s) => (
                  <div key={s.season_number} className="p-3 rounded-lg bg-surface-raised border border-border flex items-center justify-between text-xs">
                    <span className="font-bold text-text-primary">
                      {s.title || `Season ${s.season_number}`}
                    </span>
                    <span className="text-text-muted bg-surface-base px-2 py-0.5 rounded border border-border font-mono">
                      {s.episodes.length} Episodes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cast Preview */}
          {details.cast && details.cast.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Cast Preview</h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {details.cast.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex-none w-24 text-center space-y-1">
                    <div className="h-16 w-16 mx-auto rounded-full overflow-hidden bg-surface-raised border border-border relative">
                      {c.profile_path ? (
                        <Image src={c.profile_path} alt={c.name} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-text-muted text-xs">
                          {c.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-text-primary truncate">{c.name}</p>
                    {c.character && <p className="text-[10px] text-text-muted truncate">{c.character}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface-raised/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <Button variant="ghost" onClick={onClose} disabled={isImporting} className="text-xs">
            Close
          </Button>

          <div className="flex items-center gap-2">
            {duplicateCheck?.isDuplicate && !importResult && (
              <Button
                variant="outline"
                onClick={() => handleExecuteImport(true)}
                disabled={isImporting}
                className="text-xs gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
              >
                {isImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Update Existing Record
              </Button>
            )}

            {!importResult && (
              <Button
                variant="cinematic"
                onClick={() => handleExecuteImport(false)}
                disabled={isImporting}
                className="text-xs gap-1.5"
              >
                {isImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                {isImporting ? "Importing & Ingesting Media..." : "Import as Draft"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
