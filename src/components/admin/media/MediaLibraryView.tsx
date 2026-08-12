/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Upload,
  RefreshCw,
  Grid,
  List as ListIcon,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MediaFileRecord, MediaFolder, MediaContentType } from "@/types/media";
import { MediaAssetCard } from "./MediaAssetCard";
import { MediaAssetDetailModal } from "./MediaAssetDetailModal";
import { MediaUploadZone } from "./MediaUploadZone";
import { getPublicMediaUrl } from "@/lib/media/utils";
import { toast } from "sonner";

export function MediaLibraryView() {
  const [assets, setAssets] = useState<MediaFileRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState<MediaFolder | "all">("all");
  const [contentType, setContentType] = useState<MediaContentType | "all">("all");
  const [sortBy, setSortBy] = useState<"created_at" | "title" | "size_bytes">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedInspectAsset, setSelectedInspectAsset] = useState<MediaFileRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (folder !== "all") params.append("folder", folder);
      if (contentType !== "all") params.append("contentType", contentType);
      params.append("page", page.toString());
      params.append("limit", "24");
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load media assets");

      const data = await res.json();
      setAssets(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load assets";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, folder, contentType, page, sortBy, sortOrder]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (folder !== "all") params.append("folder", folder);
        if (contentType !== "all") params.append("contentType", contentType);
        params.append("page", page.toString());
        params.append("limit", "24");
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);

        const res = await fetch(`/api/admin/media?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load media assets");

        const data = await res.json();
        if (isMounted) {
          setAssets(data.items || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load assets";
        if (isMounted) toast.error(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [search, folder, contentType, page, sortBy, sortOrder]);

  const handleInspect = (asset: MediaFileRecord) => {
    setSelectedInspectAsset(asset);
    setDetailModalOpen(true);
  };

  const handleUpdate = (updated: MediaFileRecord) => {
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    if (selectedInspectAsset?.id === updated.id) {
      setSelectedInspectAsset(updated);
    }
  };

  const handleDeleteSuccess = (deletedId: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== deletedId));
    setTotal((prev) => Math.max(0, prev - 1));
  };

  const folderTabs: { id: MediaFolder | "all"; label: string }[] = [
    { id: "all", label: "All Assets" },
    { id: "movie", label: "Movies" },
    { id: "series", label: "Series" },
    { id: "people", label: "People" },
    { id: "advertisements", label: "Advertisements" },
    { id: "system", label: "System" },
    { id: "users", label: "Users" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/80 p-6 rounded-2xl border border-zinc-800/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <span>Media Engine & DAM</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-medium">
              Phase 03
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Centralized Supabase storage management for movies, series, cast, ads, and platform assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => fetchAssets()}
            variant="outline"
            size="sm"
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-900"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Button
            onClick={() => setUploadDialogOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold shadow-lg shadow-amber-500/10"
          >
            <Upload className="w-4 h-4 mr-1.5" /> Upload Asset
          </Button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="space-y-4">
        {/* Folder Category Tabs */}
        <div className="flex overflow-x-auto gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800/80 no-scrollbar">
          {folderTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFolder(tab.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                folder === tab.id
                  ? "bg-amber-500 text-zinc-950 font-semibold shadow-md"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search, Type Filter, Sort, View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search assets by title, filename, alt..."
              className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-200 text-xs h-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Content Type Filter */}
            <select
              value={contentType}
              onChange={(e) => {
                setContentType(e.target.value as MediaContentType | "all");
                setPage(1);
              }}
              className="h-10 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Media Types</option>
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

            {/* Sort Order */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-");
                setSortBy(sb as "created_at" | "title" | "size_bytes");
                setSortOrder(so as "asc" | "desc");
              }}
              className="h-10 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="size_bytes-desc">File Size (Largest)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${viewMode === "grid" ? "bg-amber-500 text-zinc-950" : "text-zinc-400"}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded ${viewMode === "list" ? "bg-amber-500 text-zinc-950" : "text-zinc-400"}`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Grid / List Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[16/10] bg-zinc-900/60 rounded-xl border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-zinc-950/60 rounded-2xl border border-zinc-800/80">
          <ImageIcon className="w-16 h-16 text-zinc-700 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-zinc-300">No media assets found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search criteria or upload new assets to your media library.
            </p>
          </div>
          <Button
            onClick={() => setUploadDialogOpen(true)}
            className="bg-amber-500 text-zinc-950 font-semibold"
          >
            <Upload className="w-4 h-4 mr-2" /> Upload Asset
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {assets.map((asset) => (
            <MediaAssetCard
              key={asset.id}
              asset={asset}
              onInspect={handleInspect}
              onDelete={() => {
                setSelectedInspectAsset(asset);
                setDetailModalOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/80 uppercase text-[10px] text-zinc-400 font-mono border-b border-zinc-800">
                <tr>
                  <th className="p-3">Preview</th>
                  <th className="p-3">Title / Filename</th>
                  <th className="p-3">Folder</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Dimensions</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Uploaded</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {assets.map((asset) => {
                  const url = asset.public_url || getPublicMediaUrl(asset.path, asset.bucket);
                  return (
                    <tr key={asset.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3">
                        {asset.mime_type.startsWith("image/") ? (
                          <img
                            src={url}
                            alt={asset.title || asset.original_name}
                            className="w-10 h-10 object-cover rounded border border-zinc-800"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center text-amber-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-medium text-zinc-200">
                        <div>{asset.title || asset.original_name}</div>
                        <div className="text-[10px] font-mono text-zinc-500 truncate max-w-[200px]">{asset.original_name}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-zinc-900 border border-zinc-800 text-amber-400 font-mono">
                          {asset.folder}
                        </span>
                      </td>
                      <td className="p-3 capitalize text-zinc-400">{asset.content_type}</td>
                      <td className="p-3 font-mono text-zinc-400">
                        {asset.width && asset.height ? `${asset.width}x${asset.height}` : "—"}
                      </td>
                      <td className="p-3 font-mono text-zinc-400">
                        {(asset.size_bytes / (1024 * 1024)).toFixed(2)} MB
                      </td>
                      <td className="p-3 text-zinc-400">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInspect(asset)}
                          className="h-8 text-xs text-amber-400 hover:text-amber-300"
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs text-zinc-400">
          <div>
            Showing <strong className="text-zinc-200">{assets.length}</strong> of <strong className="text-zinc-200">{total}</strong> assets
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-zinc-800 text-zinc-300"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <span>
              Page <strong className="text-zinc-200">{page}</strong> of <strong className="text-zinc-200">{totalPages}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="border-zinc-800 text-zinc-300"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Modal Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-100">Upload Media Asset</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Drag and drop files to store in the platform media repository.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <MediaUploadZone
              onUploadSuccess={() => {
                fetchAssets();
                setUploadDialogOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Inspector Modal */}
      <MediaAssetDetailModal
        asset={selectedInspectAsset}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onUpdate={handleUpdate}
        onDelete={handleDeleteSuccess}
      />
    </div>
  );
}
