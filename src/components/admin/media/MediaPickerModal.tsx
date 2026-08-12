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
import { Search, Image as ImageIcon, Check } from "lucide-react";
import { MediaFileRecord, MediaFolder, MediaContentType } from "@/types/media";
import { MediaAssetCard } from "./MediaAssetCard";
import { MediaUploadZone } from "./MediaUploadZone";
import { getPublicMediaUrl } from "@/lib/media/utils";

interface MediaPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAsset: (asset: MediaFileRecord, url: string) => void;
  folder?: MediaFolder;
  allowedTypes?: MediaContentType[];
  title?: string;
}

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelectAsset,
  folder: initialFolder,
  allowedTypes,
  title = "Select Media Asset",
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [assets, setAssets] = useState<MediaFileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<MediaFolder | "all">(initialFolder || "all");
  const [selectedType, setSelectedType] = useState<MediaContentType | "all">("all");
  const [selectedAsset, setSelectedAsset] = useState<MediaFileRecord | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (open) {
      const loadAssets = async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams();
          if (search) params.append("search", search);
          if (selectedFolder !== "all") params.append("folder", selectedFolder);
          if (selectedType !== "all") params.append("contentType", selectedType);
          params.append("limit", "20");

          const res = await fetch(`/api/admin/media?${params.toString()}`);
          if (!res.ok) throw new Error("Failed to fetch assets");
          const data = await res.json();
          if (isMounted) setAssets(data.items || []);
        } catch (err) {
          console.error("Error fetching media library assets:", err);
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      loadAssets();
    }
    return () => {
      isMounted = false;
    };
  }, [open, search, selectedFolder, selectedType]);

  const handleConfirmSelection = () => {
    if (!selectedAsset) return;
    const url = selectedAsset.public_url || getPublicMediaUrl(selectedAsset.path, selectedAsset.bucket);
    onSelectAsset(selectedAsset, url);
    onOpenChange(false);
  };

  const handleUploadSuccess = (record: MediaFileRecord, url: string) => {
    onSelectAsset(record, url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-800/80">
          <DialogTitle className="text-xl font-bold text-zinc-100 flex items-center justify-between">
            <span>{title}</span>
            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-normal">
              <button
                onClick={() => setActiveTab("library")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === "library"
                    ? "bg-amber-500 text-zinc-950 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Media Library
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === "upload"
                    ? "bg-amber-500 text-zinc-950 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Upload New
              </button>
            </div>
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Choose an existing asset from the platform media library or upload a new file.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {activeTab === "upload" ? (
            <div className="max-w-xl mx-auto py-4">
              <MediaUploadZone
                onUploadSuccess={handleUploadSuccess}
                defaultFolder={initialFolder || "system"}
                defaultContentType={allowedTypes?.[0] || "asset"}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search media assets..."
                    className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-200 text-xs h-10"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value as MediaFolder | "all")}
                    className="h-10 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="all">All Folders</option>
                    <option value="movie">Movies</option>
                    <option value="series">Series</option>
                    <option value="people">People</option>
                    <option value="advertisements">Ads</option>
                    <option value="system">System</option>
                    <option value="users">Users</option>
                  </select>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as MediaContentType | "all")}
                    className="h-10 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="all">All Types</option>
                    <option value="poster">Poster</option>
                    <option value="backdrop">Backdrop</option>
                    <option value="banner">Banner</option>
                    <option value="thumbnail">Thumbnail</option>
                    <option value="profile">Profile</option>
                    <option value="logo">Logo</option>
                    <option value="trailer">Trailer</option>
                    <option value="ad_creative">Ad Creative</option>
                  </select>
                </div>
              </div>

              {/* Grid of Assets */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-8">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-[16/10] bg-zinc-900/80 rounded-xl animate-pulse border border-zinc-800" />
                  ))}
                </div>
              ) : assets.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-zinc-900/30 rounded-xl border border-zinc-800/80">
                  <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto" />
                  <p className="text-sm text-zinc-400">No media assets found</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("upload")}
                    className="border-zinc-800 text-zinc-300"
                  >
                    Upload Asset Now
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {assets.map((asset) => (
                    <MediaAssetCard
                      key={asset.id}
                      asset={asset}
                      isSelected={selectedAsset?.id === asset.id}
                      onSelect={(item) => setSelectedAsset(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {activeTab === "library" && (
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between">
            <div className="text-xs text-zinc-400">
              {selectedAsset ? (
                <span>
                  Selected: <strong className="text-amber-400">{selectedAsset.title || selectedAsset.original_name}</strong>
                </span>
              ) : (
                <span>Click an asset to select it</span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="border-zinc-800 text-zinc-300"
              >
                Cancel
              </Button>
              <Button
                disabled={!selectedAsset}
                size="sm"
                onClick={handleConfirmSelection}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold"
              >
                <Check className="w-4 h-4 mr-1" /> Confirm Selection
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
