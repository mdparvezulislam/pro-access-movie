/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Copy,
  Check,
  Trash2,
  Save,
  RefreshCw,
  ExternalLink,
  FileText,
} from "lucide-react";
import { MediaFileRecord, MediaFolder, MediaContentType, AccessStrategy } from "@/types/media";
import { getPublicMediaUrl } from "@/lib/media/utils";
import { toast } from "sonner";

interface MediaAssetDetailModalProps {
  asset: MediaFileRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (updated: MediaFileRecord) => void;
  onDelete?: (deletedId: string) => void;
}

export function MediaAssetDetailModal({
  asset,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: MediaAssetDetailModalProps) {
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [folder, setFolder] = useState<MediaFolder>("system");
  const [contentType, setContentType] = useState<MediaContentType>("asset");
  const [accessStrategy, setAccessStrategy] = useState<AccessStrategy>("public");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (asset) {
      const t = asset.title || asset.original_name;
      const alt = asset.alt_text || "";
      const f = (asset.folder as MediaFolder) || "system";
      const ct = (asset.content_type as MediaContentType) || "asset";
      const strat = (asset.access_strategy as AccessStrategy) || "public";

      const timer = setTimeout(() => {
        setTitle(t);
        setAltText(alt);
        setFolder(f);
        setContentType(ct);
        setAccessStrategy(strat);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [asset]);

  if (!asset) return null;

  const displayUrl = asset.public_url || getPublicMediaUrl(asset.path, asset.bucket);
  const isImage = asset.mime_type.startsWith("image/");
  const isVideo = asset.mime_type.startsWith("video/");

  const formattedSize =
    asset.size_bytes > 1024 * 1024
      ? `${(asset.size_bytes / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(asset.size_bytes / 1024)} KB`;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/media/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          altText,
          folder,
          contentType,
          accessStrategy,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update asset");

      toast.success("Asset metadata updated");
      if (onUpdate) onUpdate(data.record);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this media asset? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/media/${asset.id}?hard=true`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete asset");
      }

      toast.success("Asset deleted successfully");
      if (onDelete) onDelete(asset.id);
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(displayUrl);
    setCopiedUrl(true);
    toast.success("URL copied");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(asset.id);
    setCopiedId(true);
    toast.success("Asset ID copied");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-800/80">
          <DialogTitle className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <span>Asset Inspector</span>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-normal bg-zinc-900 border border-zinc-800 text-amber-400">
              {asset.folder} / {asset.content_type}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            View preview, edit metadata, or manage media asset properties.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 max-h-[80vh] overflow-y-auto">
          {/* Left Column: Preview Lightbox */}
          <div className="md:col-span-7 bg-zinc-900/60 p-6 border-b md:border-b-0 md:border-r border-zinc-800/80 flex flex-col items-center justify-center min-h-[300px]">
            {isImage ? (
              <div className="relative group max-h-[450px] overflow-hidden rounded-xl border border-zinc-800">
                <img
                  src={displayUrl}
                  alt={title}
                  className="max-h-[450px] w-auto object-contain rounded-xl"
                />
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 p-2 rounded-lg bg-zinc-950/80 hover:bg-amber-500 text-zinc-300 hover:text-zinc-950 transition-colors border border-zinc-700"
                  title="Open full image in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : isVideo ? (
              <div className="w-full space-y-2">
                <video
                  src={displayUrl}
                  controls
                  className="w-full max-h-[400px] rounded-xl border border-zinc-800"
                />
              </div>
            ) : (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-16 h-16 text-zinc-600 mx-auto" />
                <p className="text-sm font-mono text-zinc-400">{asset.mime_type}</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs text-zinc-400">
              {asset.width && asset.height && (
                <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
                  Dimensions: <strong className="text-zinc-200">{asset.width} &times; {asset.height}</strong>
                </span>
              )}
              <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
                Size: <strong className="text-zinc-200">{formattedSize}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
                MIME: <strong className="text-zinc-200">{asset.mime_type}</strong>
              </span>
            </div>
          </div>

          {/* Right Column: Metadata Form & Details */}
          <div className="md:col-span-5 p-6 space-y-5">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Metadata</h4>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-zinc-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Alt Text</label>
                <Input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Alt text for accessibility & SEO"
                  className="bg-zinc-900 border-zinc-800 text-zinc-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Folder</label>
                  <select
                    value={folder}
                    onChange={(e) => setFolder(e.target.value as MediaFolder)}
                    className="w-full h-9 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="movie">Movie</option>
                    <option value="series">TV Series</option>
                    <option value="people">People</option>
                    <option value="advertisements">Advertisements</option>
                    <option value="system">System</option>
                    <option value="users">Users</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Media Type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as MediaContentType)}
                    className="w-full h-9 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="poster">Poster</option>
                    <option value="backdrop">Backdrop</option>
                    <option value="banner">Banner</option>
                    <option value="thumbnail">Thumbnail</option>
                    <option value="profile">Profile</option>
                    <option value="logo">Logo</option>
                    <option value="trailer">Trailer</option>
                    <option value="ad_creative">Ad Creative</option>
                    <option value="promo">Promo</option>
                    <option value="asset">Generic Asset</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 space-y-3">
              <h4 className="text-sm font-semibold text-zinc-400">Technical Details</h4>
              <div className="space-y-2 text-xs text-zinc-400">
                <div className="flex justify-between items-center bg-zinc-900/40 p-2 rounded border border-zinc-800">
                  <span className="font-mono text-[11px] text-zinc-400 truncate max-w-[200px]">{asset.id}</span>
                  <Button size="sm" variant="ghost" onClick={handleCopyId} className="h-6 px-2 text-[10px] text-zinc-300">
                    {copiedId ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 mr-1" />}
                    Copy ID
                  </Button>
                </div>

                <div className="flex justify-between">
                  <span>Storage Path:</span>
                  <span className="font-mono text-zinc-300 text-[11px] truncate max-w-[180px]">{asset.path}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bucket:</span>
                  <span className="font-mono text-zinc-300">{asset.bucket}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uploaded:</span>
                  <span className="text-zinc-300">{new Date(asset.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-zinc-800/80 space-y-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold"
              >
                {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Metadata
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={handleCopyUrl}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-zinc-800 text-zinc-200"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 mr-1 text-green-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  Copy URL
                </Button>

                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  variant="outline"
                  size="sm"
                  className="border-red-900/50 text-red-400 hover:bg-red-950/50 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
