/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Eye, Copy, Trash2, Check, FileVideo, FileText } from "lucide-react";
import { MediaFileRecord } from "@/types/media";
import { getPublicMediaUrl } from "@/lib/media/utils";
import { toast } from "sonner";

interface MediaAssetCardProps {
  asset: MediaFileRecord;
  onSelect?: (asset: MediaFileRecord) => void;
  onInspect?: (asset: MediaFileRecord) => void;
  onDelete?: (asset: MediaFileRecord) => void;
  isSelected?: boolean;
}

export function MediaAssetCard({
  asset,
  onSelect,
  onInspect,
  onDelete,
  isSelected = false,
}: MediaAssetCardProps) {
  const [copied, setCopied] = useState(false);

  const displayUrl = asset.public_url || getPublicMediaUrl(asset.path, asset.bucket);
  const isImage = asset.mime_type.startsWith("image/");
  const isVideo = asset.mime_type.startsWith("video/");

  const formattedSize =
    asset.size_bytes > 1024 * 1024
      ? `${(asset.size_bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(asset.size_bytes / 1024)} KB`;

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(displayUrl);
    setCopied(true);
    toast.success("Asset URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => (onSelect ? onSelect(asset) : onInspect ? onInspect(asset) : null)}
      className={`group relative rounded-xl overflow-hidden border bg-zinc-950 transition-all duration-200 cursor-pointer ${
        isSelected
          ? "border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/10 scale-[1.02]"
          : "border-zinc-800/80 hover:border-zinc-600 hover:shadow-xl hover:shadow-black/50"
      }`}
    >
      {/* Aspect Ratio Preview Box */}
      <div className="relative aspect-[16/10] bg-zinc-900 flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img
            src={displayUrl}
            alt={asset.alt_text || asset.title || asset.original_name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : isVideo ? (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center gap-2">
            <FileVideo className="w-10 h-10 text-amber-400 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
              {asset.content_type || "Video"}
            </span>
          </div>
        ) : (
          <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center gap-1 text-zinc-500">
            <FileText className="w-8 h-8" />
            <span className="text-[10px] font-mono">{asset.mime_type}</span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase bg-zinc-950/80 backdrop-blur-md text-amber-400 border border-zinc-800">
            {asset.folder || "system"}
          </span>

          {asset.width && asset.height && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/70 backdrop-blur-sm text-zinc-300">
              {asset.width}&times;{asset.height}
            </span>
          )}
        </div>

        {/* Hover Actions Toolbar */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2 backdrop-blur-[2px]">
          {onInspect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInspect(asset);
              }}
              title="Inspect asset details"
              className="p-2 rounded-lg bg-zinc-900/90 text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors border border-zinc-700"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleCopyUrl}
            title="Copy URL"
            className="p-2 rounded-lg bg-zinc-900/90 text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 transition-colors border border-zinc-700"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(asset);
              }}
              title="Delete asset"
              className="p-2 rounded-lg bg-zinc-900/90 text-zinc-200 hover:bg-red-500 hover:text-white transition-colors border border-zinc-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-3 space-y-1">
        <h4 className="text-xs font-semibold text-zinc-200 truncate group-hover:text-amber-400 transition-colors">
          {asset.title || asset.original_name}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <span className="capitalize">{asset.content_type}</span>
          <span className="font-mono">{formattedSize}</span>
        </div>
      </div>
    </div>
  );
}
