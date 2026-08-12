"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Megaphone, Trash2, ExternalLink, Sparkles, Sliders, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartAdGateModal } from "@/components/player/SmartAdGateModal";
import { DEFAULT_AD_GATE_CONFIG } from "@/lib/ads/ad-gate";

export interface AdCreativeItem {
  id: string;
  title: string;
  type: string;
  media_url: string;
  destination_url: string;
  cta_text: string;
}

interface AdvertisementsStudioClientProps {
  initialCreatives: AdCreativeItem[];
  initialPlacements?: Record<string, unknown>[];
}

export function AdvertisementsStudioClient({
  initialCreatives,
}: AdvertisementsStudioClientProps) {
  const [creatives, setCreatives] = useState(initialCreatives);
  const [showModal, setShowModal] = useState(false);
  const [showGatePreview, setShowGatePreview] = useState(false);
  const [gateConfig, setGateConfig] = useState(DEFAULT_AD_GATE_CONFIG);
  const [formData, setFormData] = useState({
    title: "",
    type: "banner",
    mediaUrl: "",
    destinationUrl: "",
    ctaText: "Learn More",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCreative = {
      id: `ad-${Date.now()}`,
      title: formData.title || "New Ad Creative",
      type: formData.type,
      media_url: formData.mediaUrl || "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200",
      destination_url: formData.destinationUrl || "https://example.com",
      cta_text: formData.ctaText || "Click Here",
      created_at: new Date().toISOString(),
    };

    setCreatives([newCreative, ...creatives]);
    setShowModal(false);
    setFormData({ title: "", type: "banner", mediaUrl: "", destinationUrl: "", ctaText: "Learn More" });
  };

  return (
    <div className="space-y-8">
      {/* Smart Ad Gate Configuration Card */}
      <div className="p-6 rounded-2xl bg-surface-base border border-border space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Sliders className="h-5 w-5 text-amber-400" /> Smart Ad Gate Settings
            </h3>
            <p className="text-xs text-text-muted">Configure player pause timing, ad view duration, skip delays, and session caps.</p>
          </div>
          <button
            onClick={() => setShowGatePreview(true)}
            className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Live Gate Preview
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
            <label className="text-xs font-bold text-text-muted">Trigger Time (Sec)</label>
            <input
              type="number"
              value={gateConfig.triggerTimeSeconds}
              onChange={(e) => setGateConfig({ ...gateConfig, triggerTimeSeconds: Number(e.target.value) })}
              className="w-full p-2 rounded-lg bg-surface-base border border-border text-sm font-bold text-text-primary focus:outline-none"
            />
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
            <label className="text-xs font-bold text-text-muted">Ad Duration (Sec)</label>
            <input
              type="number"
              value={gateConfig.adDurationSeconds}
              onChange={(e) => setGateConfig({ ...gateConfig, adDurationSeconds: Number(e.target.value) })}
              className="w-full p-2 rounded-lg bg-surface-base border border-border text-sm font-bold text-text-primary focus:outline-none"
            />
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
            <label className="text-xs font-bold text-text-muted">Skip Delay (Sec)</label>
            <input
              type="number"
              value={gateConfig.skipDelaySeconds}
              onChange={(e) => setGateConfig({ ...gateConfig, skipDelaySeconds: Number(e.target.value) })}
              className="w-full p-2 rounded-lg bg-surface-base border border-border text-sm font-bold text-text-primary focus:outline-none"
            />
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
            <label className="text-xs font-bold text-text-muted">Max Gates / Session</label>
            <input
              type="number"
              value={gateConfig.maxGatesPerSession}
              onChange={(e) => setGateConfig({ ...gateConfig, maxGatesPerSession: Number(e.target.value) })}
              className="w-full p-2 rounded-lg bg-surface-base border border-border text-sm font-bold text-text-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-red-500" /> Active Ad Creatives ({creatives.length})
        </h2>
        <Button onClick={() => setShowModal(true)} variant="cinematic" className="gap-2">
          <Plus className="h-4 w-4" /> Create Ad Creative
        </Button>
      </div>

      {/* Creatives List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creatives.map((c) => (
          <div key={c.id} className="p-5 rounded-2xl bg-surface-base border border-border space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="relative h-32 w-full rounded-xl overflow-hidden bg-surface-raised border border-border">
                <Image src={c.media_url || "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200"} alt={c.title} fill className="object-cover" />
              </div>
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600/10 text-red-400 border border-red-500/20">
                  {c.type}
                </span>
                <h4 className="text-sm font-bold text-text-primary line-clamp-1">{c.title}</h4>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <a href={c.destination_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-red-400 flex items-center gap-1 hover:underline">
                Target URL <ExternalLink className="h-3 w-3" />
              </a>
              <button
                onClick={() => setCreatives(creatives.filter((item) => item.id !== c.id))}
                className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-surface-raised transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Ad Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-surface-base border border-border rounded-2xl p-6 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-red-500" /> Create Ad Creative
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-muted block mb-1">Ad Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Upgrade to Premium HD Server"
                  className="w-full p-2.5 rounded-xl bg-surface-raised border border-border text-sm text-text-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-muted block mb-1">Ad Format</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text-primary focus:outline-none"
                  >
                    <option value="banner">Banner</option>
                    <option value="card">Native Card</option>
                    <option value="overlay">Player Overlay</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted block mb-1">Button Text</label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="e.g. Learn More"
                    className="w-full p-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted block mb-1">Media Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-1574375927938..."
                  className="w-full p-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted block mb-1">Destination Target URL</label>
                <input
                  type="url"
                  required
                  value={formData.destinationUrl}
                  onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full p-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="cinematic">
                  Save & Publish Ad
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Ad Gate Live Preview */}
      {showGatePreview && (
        <SmartAdGateModal
          creative={{
            id: "preview-ad",
            title: "PRO ACCESS MOVIE Premium HD Streaming Sponsor",
            type: "card",
            mediaUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200",
            destinationUrl: "https://example.com",
            ctaText: "Upgrade Now",
          }}
          config={gateConfig}
          onUnlock={() => setShowGatePreview(false)}
        />
      )}
    </div>
  );
}
