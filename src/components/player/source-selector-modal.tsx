"use client";

import { PlaybackSource } from "@/lib/playback/sources";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Radio, Download, ShieldCheck } from "lucide-react";

interface SourceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: PlaybackSource[];
  activeSourceId?: string;
  onSelectSource: (source: PlaybackSource) => void;
  title?: string;
}

export function SourceSelectorModal({
  isOpen,
  onClose,
  sources,
  activeSourceId,
  onSelectSource,
  title = "Playback & Download Mirrors",
}: SourceSelectorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-500" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-text-secondary">
            Select an authorized high-speed streaming server or download mirror
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {sources.map((source) => {
            const isSelected = source.id === activeSourceId;
            return (
              <div
                key={source.id}
                onClick={() => {
                  onSelectSource(source);
                  onClose();
                }}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-red-950/40 border-red-600/80 shadow-md shadow-red-950/20"
                    : "bg-surface-base border-border hover:bg-surface-raised"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-surface-overlay flex items-center justify-center text-red-500">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-text-primary">{source.label}</span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-overlay text-[10px] font-medium text-red-400 uppercase">
                        {source.quality}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">{source.providerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg bg-surface-overlay hover:bg-surface-hover text-text-secondary hover:text-white transition-colors"
                    title="Direct Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <Button
                    size="sm"
                    variant={isSelected ? "cinematic" : "outline"}
                    className="h-8 text-xs"
                  >
                    {isSelected ? "Active" : "Switch"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
