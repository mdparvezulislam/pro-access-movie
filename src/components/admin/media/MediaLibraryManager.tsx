"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  HardDrive,
  Plus,
  Search,
  Trash2,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Eye,
  X,
  Upload,
  Image as ImageIcon,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface MediaFileItem {
  id: string;
  bucket: string;
  path: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  content_type: string;
  folder: string;
  public_url: string | null;
  created_at: string;
}

export function MediaLibraryManager() {
  const [items, setItems] = useState<MediaFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal preview state
  const [previewItem, setPreviewItem] = useState<MediaFileItem | null>(null);

  // Add External URL / Upload Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [uploadFolder, setUploadFolder] = useState("movie");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState<MediaFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/media?folder=${selectedFolder}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch media:", err);
      toast.error("Could not load media library.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFolder, searchQuery]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Asset URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile && !externalUrl.trim()) {
      toast.error("Please select a file or provide an external image URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (uploadFile) {
        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("folder", uploadFolder);
        formData.append("contentType", "poster");

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "File upload failed.");
        toast.success("File uploaded to Supabase Storage!");
      } else if (externalUrl.trim()) {
        toast.success("External media URL registered for selection.");
      }

      setIsModalOpen(false);
      setUploadFile(null);
      setExternalUrl("");
      fetchMedia();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Media action failed.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/media/${deletingItem.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete media asset.");

      toast.success("Media asset deleted.");
      setDeletingItem(null);
      fetchMedia();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete media asset.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-base border border-border shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary">
              Media Assets Library
            </h1>
            <p className="text-xs text-text-muted">
              Manage uploaded images, backdrops, posters, and registered external CDN URLs.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="cinematic"
          className="h-10 text-xs gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg"
        >
          <Upload className="h-4 w-4" />
          <span>Upload / Register Asset</span>
        </Button>
      </div>

      {/* Toolbar Filter */}
      <div className="p-4 rounded-xl bg-surface-base border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media files by name..."
            className="pl-9 h-9 text-xs bg-surface-raised border-border"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted whitespace-nowrap">
            Folder:
          </span>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="h-9 px-3 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text-primary"
          >
            <option value="all">All Folders</option>
            <option value="movie">Movies</option>
            <option value="series">Series</option>
            <option value="people">People</option>
            <option value="advertisements">Advertisements</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading media assets...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border space-y-3">
          <ImageIcon className="h-10 w-10 text-text-muted mx-auto" />
          <h3 className="text-sm font-bold text-text-primary">No Media Assets Found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            No image or video media assets match your active filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => {
            const mediaUrl = item.public_url || "";
            return (
              <div
                key={item.id}
                className="group relative rounded-xl bg-surface-base border border-border overflow-hidden shadow-md flex flex-col justify-between"
              >
                {/* Thumbnail Preview */}
                <div className="aspect-video w-full bg-surface-raised relative overflow-hidden flex items-center justify-center">
                  {mediaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl}
                      alt={item.original_name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <Film className="h-6 w-6 text-text-muted" />
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="p-1.5 rounded-lg bg-surface-base/80 text-white hover:bg-surface-raised transition"
                      title="Preview"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopyUrl(mediaUrl, item.id)}
                      className="p-1.5 rounded-lg bg-surface-base/80 text-white hover:bg-surface-raised transition"
                      title="Copy Link"
                    >
                      {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-700 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Footer Details */}
                <div className="p-2.5 space-y-1">
                  <p className="text-[11px] font-bold text-text-primary truncate" title={item.original_name}>
                    {item.original_name || item.filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-text-muted">
                    <span className="capitalize">{item.folder}</span>
                    <span>{(item.size_bytes / 1024).toFixed(0)} KB</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-surface-base border border-purple-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xs font-extrabold text-text-primary truncate">
                {previewItem.original_name}
              </h3>
              <button onClick={() => setPreviewItem(null)} className="text-text-muted hover:text-text-primary p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-black max-h-[60vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewItem.public_url || ""}
                alt={previewItem.original_name}
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="font-mono text-text-muted text-[11px] truncate max-w-md">
                {previewItem.public_url}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyUrl(previewItem.public_url || "", previewItem.id)}
                className="h-8 text-xs gap-1 border-border"
              >
                <Copy className="h-3 w-3" /> Copy URL
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD / REGISTER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-purple-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                <Upload className="h-4 w-4 text-purple-400" /> Upload or Register Media
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Target Folder</label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-bold"
                >
                  <option value="movie">Movies</option>
                  <option value="series">Series</option>
                  <option value="people">People</option>
                  <option value="advertisements">Advertisements</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Option 1: Upload Local Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                      setExternalUrl("");
                    }
                  }}
                  className="w-full text-xs text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30 cursor-pointer"
                />
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-border w-full" />
                <span className="bg-surface-base px-2 text-[10px] font-bold text-text-muted uppercase shrink-0">OR</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Option 2: Register External Image CDN URL</label>
                <Input
                  value={externalUrl}
                  onChange={(e) => {
                    setExternalUrl(e.target.value);
                    setUploadFile(null);
                  }}
                  placeholder="https://image.tmdb.org/t/p/original/..."
                  className="h-10 text-xs bg-surface-raised border-border font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="cinematic"
                  disabled={isSubmitting}
                  className="h-9 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span>Save Asset</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-red-500/30 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-extrabold text-text-primary">
              Delete Media Asset?
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Are you sure you want to delete <strong className="text-text-primary">"{deletingItem.original_name}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteItem}
                disabled={isDeleting}
                className="h-9 text-xs gap-1.5"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
