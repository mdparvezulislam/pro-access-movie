"use client";

import { useState } from "react";
import { Film, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MediaGalleryItem {
  id: string;
  bucket: string;
  path: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  signedUrl?: string;
}

interface MediaGalleryProps {
  items: MediaGalleryItem[];
  onArchive?: (id: string) => void;
}

export function MediaGallery({ items, onArchive }: MediaGalleryProps) {
  const [activeItems, setActiveItems] = useState<MediaGalleryItem[]>(items);

  const handleArchive = async (id: string) => {
    setActiveItems((prev) => prev.filter((item) => item.id !== id));
    if (onArchive) onArchive(id);
  };

  if (activeItems.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-surface-base border border-border-muted text-text-muted text-xs">
        No active media assets attached to this content item.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {activeItems.map((item) => (
        <div
          key={item.id}
          className="group relative rounded-xl overflow-hidden bg-card border border-border flex flex-col"
        >
          <div className="aspect-[2/3] w-full bg-surface-raised relative flex items-center justify-center">
            {item.signedUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={item.signedUrl}
                alt={item.original_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Film className="h-8 w-8 text-text-muted" />
            )}

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {item.signedUrl && (
                <a
                  href={item.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleArchive(item.id)}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-2.5 bg-surface-base text-[11px]">
            <p className="font-semibold text-white truncate">{item.original_name}</p>
            <p className="text-text-muted capitalize">
              {item.content_type} • {(item.size_bytes / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
