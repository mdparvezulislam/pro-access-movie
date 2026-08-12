/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Image as ImageIcon, X, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaFileRecord, MediaFolder, MediaContentType, MediaAspectRatio } from "@/types/media";
import { MediaPickerModal } from "./MediaPickerModal";

interface MediaPickerProps {
  value?: string | null;
  onChange: (url: string, asset?: MediaFileRecord) => void;
  folder?: MediaFolder;
  allowedTypes?: MediaContentType[];
  aspectRatio?: MediaAspectRatio;
  label?: string;
  placeholder?: string;
}

export function MediaPicker({
  value,
  onChange,
  folder = "system",
  allowedTypes,
  aspectRatio = "backdrop",
  label,
  placeholder = "Select or upload media",
}: MediaPickerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "poster":
        return "aspect-[2/3] max-w-[200px]";
      case "backdrop":
        return "aspect-[16/9] w-full max-w-md";
      case "banner":
        return "aspect-[3/1] w-full max-w-lg";
      case "square":
        return "aspect-square max-w-[160px]";
      default:
        return "aspect-[16/9] w-full max-w-md";
    }
  };

  const handleSelect = (asset: MediaFileRecord, url: string) => {
    onChange(url, asset);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", undefined);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-medium text-zinc-300">{label}</label>}

      <div
        onClick={() => setModalOpen(true)}
        className={`relative ${getAspectClass()} rounded-xl border border-dashed border-zinc-800 bg-zinc-950/80 hover:border-zinc-600 transition-all duration-200 overflow-hidden group cursor-pointer flex flex-col items-center justify-center`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Selected Media"
              className="w-full h-full object-cover"
            />

            {/* Hover overlay with actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary" className="bg-zinc-900 text-zinc-200 text-xs border border-zinc-700">
                <FolderOpen className="w-3.5 h-3.5 mr-1" /> Change
              </Button>
              <Button size="sm" variant="destructive" onClick={handleClear} className="text-xs">
                <X className="w-3.5 h-3.5 mr-1" /> Remove
              </Button>
            </div>
          </>
        ) : (
          <div className="p-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 mx-auto">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-300">{placeholder}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Click to browse library or upload</p>
            </div>
          </div>
        )}
      </div>

      <MediaPickerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelectAsset={handleSelect}
        folder={folder}
        allowedTypes={allowedTypes}
        title={label ? `Select ${label}` : "Select Media Asset"}
      />
    </div>
  );
}
