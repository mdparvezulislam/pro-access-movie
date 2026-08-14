"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  AlertTriangle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Layout,
  Calendar,
  Layers,
  Target,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { AdRenderer } from "@/components/ads/AdRenderer";
import { AdCreative, AdType, AdStatus } from "@/lib/ads/ad-engine";
import { toast } from "sonner";

interface CampaignOption {
  id: string;
  name: string;
  status: string;
}

interface AdvertisementRecord extends AdCreative {
  name: string;
  description?: string;
  placementKey: string;
  status: AdStatus;
  priority: number;
  startAt?: string | null;
  endAt?: string | null;
  frequencyCap?: { maxPerSession?: number };
  targeting?: { devices?: string[]; contexts?: string[] };
  impressionEnabled?: boolean;
  clickEnabled?: boolean;
  impressionsCount: number;
  clicksCount: number;
  ctr: number;
  created_at?: string;
}

const PLACEMENT_OPTIONS = [
  { key: "home_hero_banner", label: "Homepage Hero Banner" },
  { key: "rail_interstitial_card", label: "Homepage Content Rail Interstitial" },
  { key: "movie_details", label: "Movie Details Page" },
  { key: "series_details", label: "TV Series Details Page" },
  { key: "watch_player", label: "Watch Page Video Player" },
  { key: "player_mid_roll", label: "Player Pre-Roll / Mid-Roll Sponsor" },
  { key: "download_area", label: "Download Links Section" },
  { key: "category", label: "Category Catalog Page" },
  { key: "genre", label: "Genre Catalog Page" },
  { key: "collection", label: "Collection Page" },
  { key: "search", label: "Search Results Page" },
];

export function AdvertisementsManager() {
  const [ads, setAds] = useState<AdvertisementRecord[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPlacement, setSelectedPlacement] = useState("all");

  // Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeFormSection, setActiveFormSection] = useState<
    "basic" | "creative" | "placement" | "schedule" | "targeting" | "delivery" | "preview"
  >("basic");

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<AdType>("banner");
  const [formMediaUrl, setFormMediaUrl] = useState("");
  const [formDestinationUrl, setFormDestinationUrl] = useState("");
  const [formCtaText, setFormCtaText] = useState("Learn More");
  const [formPlacementKey, setFormPlacementKey] = useState("home_hero_banner");
  const [formStatus, setFormStatus] = useState<AdStatus>("active");
  const [formPriority, setFormPriority] = useState<number>(1);
  const [formStartAt, setFormStartAt] = useState("");
  const [formEndAt, setFormEndAt] = useState("");
  const [formMaxPerSession, setFormMaxPerSession] = useState<number>(3);
  const [formTargetDevice, setFormTargetDevice] = useState("all");
  const [formCampaignId, setFormCampaignId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action Confirmation Modals
  const [deletingAd, setDeletingAd] = useState<AdvertisementRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/admin/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    }
  };

  const loadAdsData = async () => {
    try {
      let url = `/api/admin/advertisements?status=${selectedStatus}&type=${selectedType}&placement=${selectedPlacement}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const rawAds = data.advertisements || [];
        const formatted: AdvertisementRecord[] = rawAds.map((a: Record<string, unknown>) => ({
          id: String(a.id),
          campaignId: a.campaign_id ? String(a.campaign_id) : undefined,
          name: String(a.name || a.title),
          title: String(a.title),
          description: a.description ? String(a.description) : undefined,
          type: (a.type as AdType) || "banner",
          mediaUrl: String(a.media_url || ""),
          destinationUrl: String(a.destination_url || ""),
          ctaText: String(a.cta_text || "Learn More"),
          placementKey: String(a.placement_key || "home_hero_banner"),
          status: (a.status as AdStatus) || "active",
          priority: Number(a.priority) || 1,
          startAt: a.start_at ? String(a.start_at) : null,
          endAt: a.end_at ? String(a.end_at) : null,
          frequencyCap: (a.frequency_cap as { maxPerSession?: number }) || { maxPerSession: 3 },
          targeting: (a.targeting as { devices?: string[]; contexts?: string[] }) || { devices: ["all"] },
          impressionEnabled: a.impression_enabled !== false,
          clickEnabled: a.click_enabled !== false,
          impressionsCount: Number(a.impressions_count || 0),
          clicksCount: Number(a.clicks_count || 0),
          ctr: Number(a.ctr || 0),
          created_at: a.created_at ? String(a.created_at) : undefined,
        }));
        setAds(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch advertisements:", err);
      toast.error("Could not load advertisements list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      await fetchCampaigns();
      if (active) {
        await loadAdsData();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [selectedStatus, selectedType, selectedPlacement, searchQuery]);

  const resetForm = () => {
    setEditingId(null);
    setFormName("");
    setFormTitle("");
    setFormDescription("");
    setFormType("banner");
    setFormMediaUrl("");
    setFormDestinationUrl("");
    setFormCtaText("Learn More");
    setFormPlacementKey("home_hero_banner");
    setFormStatus("active");
    setFormPriority(1);
    setFormStartAt("");
    setFormEndAt("");
    setFormMaxPerSession(3);
    setFormTargetDevice("all");
    setFormCampaignId("");
    setActiveFormSection("basic");
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: AdvertisementRecord) => {
    setEditingId(item.id);
    setFormName(item.name || item.title);
    setFormTitle(item.title);
    setFormDescription(item.description || "");
    setFormType(item.type);
    setFormMediaUrl(item.mediaUrl);
    setFormDestinationUrl(item.destinationUrl);
    setFormCtaText(item.ctaText);
    setFormPlacementKey(item.placementKey);
    setFormStatus(item.status);
    setFormPriority(item.priority);
    setFormStartAt(item.startAt ? item.startAt.slice(0, 16) : "");
    setFormEndAt(item.endAt ? item.endAt.slice(0, 16) : "");
    setFormMaxPerSession(item.frequencyCap?.maxPerSession || 3);
    setFormTargetDevice(item.targeting?.devices?.[0] || "all");
    setFormCampaignId(item.campaignId || "");
    setActiveFormSection("basic");
    setIsModalOpen(true);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formMediaUrl.trim() || !formDestinationUrl.trim()) {
      toast.error("Title, Media URL, and Target Destination URL are required.");
      return;
    }

    if (formStartAt && formEndAt && new Date(formStartAt) > new Date(formEndAt)) {
      toast.error("End schedule time must be after Start schedule time.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim() || formTitle.trim(),
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        type: formType,
        media_url: formMediaUrl.trim(),
        destination_url: formDestinationUrl.trim(),
        cta_text: formCtaText.trim() || "Learn More",
        placement_key: formPlacementKey,
        status: formStatus,
        priority: Number(formPriority),
        start_at: formStartAt ? new Date(formStartAt).toISOString() : null,
        end_at: formEndAt ? new Date(formEndAt).toISOString() : null,
        frequency_cap: { maxPerSession: Number(formMaxPerSession) },
        targeting: { devices: [formTargetDevice] },
        campaign_id: formCampaignId || null,
      };

      const url = editingId ? `/api/admin/advertisements/${editingId}` : "/api/admin/advertisements";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save advertisement.");

      toast.success(editingId ? "Advertisement updated!" : "Advertisement published!");
      setIsModalOpen(false);
      loadAdsData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: AdvertisementRecord) => {
    const nextStatus: AdStatus = item.status === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/admin/advertisements/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        toast.success(`Advertisement ${nextStatus === "active" ? "enabled" : "paused"}.`);
        loadAdsData();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDuplicateAd = async (item: AdvertisementRecord) => {
    setDuplicatingId(item.id);
    try {
      const res = await fetch(`/api/admin/advertisements/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not duplicate advertisement.");

      toast.success("Advertisement duplicated into Draft!");
      loadAdsData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to duplicate ad.";
      toast.error(msg);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDeleteAd = async () => {
    if (!deletingAd) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/advertisements/${deletingAd.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete advertisement.");

      toast.success("Advertisement permanently deleted.");
      setDeletingAd(null);
      loadAdsData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete advertisement.";
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
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary">
              Advertisements Studio
            </h1>
            <p className="text-xs text-text-muted">
              Manage all advertisements, placements, scheduling, frequency caps, and live delivery.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          variant="cinematic"
          className="h-10 text-xs gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Create Advertisement</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-surface-base border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, title, or target URL..."
              className="pl-9 h-9 text-xs bg-surface-raised border-border"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted whitespace-nowrap">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text-primary"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted whitespace-nowrap">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text-primary"
            >
              <option value="all">All Types</option>
              <option value="banner">Banner</option>
              <option value="card">Native Card</option>
              <option value="video">Video Sponsor</option>
              <option value="overlay">Player Overlay</option>
              <option value="interstitial">Interstitial</option>
            </select>
          </div>

          {/* Placement Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted whitespace-nowrap">Placement:</span>
            <select
              value={selectedPlacement}
              onChange={(e) => setSelectedPlacement(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text-primary"
            >
              <option value="all">All Placements</option>
              {PLACEMENT_OPTIONS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / Grid */}
      {isLoading ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading advertisements...</p>
        </div>
      ) : ads.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border space-y-3">
          <Megaphone className="h-10 w-10 text-text-muted mx-auto" />
          <h3 className="text-sm font-bold text-text-primary">No Advertisements Found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {searchQuery || selectedStatus !== "all"
              ? "No advertisements match your active filters."
              : "Create your first advertisement to launch a campaign."}
          </p>
          <Button onClick={handleOpenCreateModal} size="sm" variant="outline" className="h-8 text-xs border-border">
            Create Advertisement
          </Button>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden lg:block rounded-2xl bg-surface-base border border-border shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised/60 text-text-muted font-bold border-b border-border uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Ad Name & Title</th>
                  <th className="py-3 px-4">Type & Placement</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Impressions / Clicks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ads.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-raised/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-400">
                      P{item.priority}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-text-primary">{item.name}</p>
                        <p className="text-[11px] text-text-muted truncate max-w-xs">{item.destinationUrl}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 space-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20 block w-max">
                        {item.type}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted block">
                        {item.placementKey}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : item.status === "paused"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : item.status === "draft"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-muted text-[11px] font-mono">
                      {item.startAt ? new Date(item.startAt).toLocaleDateString() : "Immediate"}
                      {" ➔ "}
                      {item.endAt ? new Date(item.endAt).toLocaleDateString() : "Ongoing"}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      <div>
                        <span className="font-bold text-text-primary">{item.impressionsCount}</span> imp /{" "}
                        <span className="font-bold text-purple-400">{item.clicksCount}</span> clicks
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">CTR: {item.ctr}%</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(item)}
                          className="h-8 w-8 text-text-muted hover:text-text-primary"
                          title={item.status === "active" ? "Pause Ad" : "Activate Ad"}
                        >
                          {item.status === "active" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicateAd(item)}
                          disabled={duplicatingId === item.id}
                          className="h-8 w-8 text-text-muted hover:text-text-primary"
                          title="Duplicate Ad"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditModal(item)}
                          className="h-8 w-8 text-text-muted hover:text-text-primary"
                          title="Edit Ad"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingAd(item)}
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          title="Delete Ad"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="lg:hidden space-y-3">
            {ads.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-surface-base border border-border shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-400">P{item.priority}</span>
                    <h4 className="text-xs font-bold text-text-primary">{item.name}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="text-[11px] text-text-muted space-y-1">
                  <p>Type: <strong className="text-text-primary capitalize">{item.type}</strong> ({item.placementKey})</p>
                  <p>CTR: <strong className="text-emerald-400">{item.ctr}%</strong> ({item.impressionsCount} imp, {item.clicksCount} clicks)</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(item)} className="h-8 text-xs border-border">
                    {item.status === "active" ? "Pause" : "Activate"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(item)} className="h-8 text-xs border-border">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeletingAd(item)} className="h-8 text-xs">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CREATE / EDIT SECTIONED MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-surface-base border border-purple-500/30 shadow-2xl p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-purple-400" />
                {editingId ? "Edit Advertisement" : "Create Advertisement"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Section Tab Bar */}
            <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-xl border border-border overflow-x-auto text-xs">
              {[
                { id: "basic", label: "Basic", icon: Layout },
                { id: "creative", label: "Creative", icon: Sparkles },
                { id: "placement", label: "Placement", icon: Layers },
                { id: "schedule", label: "Schedule", icon: Calendar },
                { id: "targeting", label: "Targeting", icon: Target },
                { id: "delivery", label: "Delivery", icon: Sliders },
                { id: "preview", label: "Preview", icon: Eye },
              ].map((sec) => {
                const IconComp = sec.icon;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveFormSection(sec.id as typeof activeFormSection)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                      activeFormSection === sec.id
                        ? "bg-purple-600 text-white shadow"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <IconComp className="h-3.5 w-3.5" />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSaveAd} className="space-y-4 text-xs">
              {/* SECTION: BASIC */}
              {activeFormSection === "basic" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-text-secondary">Internal Ad Name *</label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      placeholder="e.g. Banglalink Eid Special Hero Banner"
                      className="h-10 text-xs bg-surface-raised border-border"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-text-secondary">Ad Creative Type *</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as AdType)}
                      className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-bold"
                    >
                      <option value="banner">Banner Image</option>
                      <option value="card">Native Card</option>
                      <option value="video">Video Pre-Roll / Sponsor</option>
                      <option value="overlay">Player Overlay</option>
                      <option value="interstitial">Interstitial</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-text-secondary">Internal Description</label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Internal notes about sponsorship campaign..."
                      className="w-full p-3 rounded-xl bg-surface-raised border border-border text-text-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: CREATIVE */}
              {activeFormSection === "creative" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-text-secondary">Media Asset URL *</label>
                    <MediaPicker
                      label="Ad Banner / Video Media"
                      value={formMediaUrl}
                      onChange={(url) => setFormMediaUrl(url)}
                      aspectRatio="backdrop"
                      folder="advertisements"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-text-secondary">Public Headline / Title *</label>
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                      placeholder="e.g. Stream Unlimited Movies with Banglalink 4G"
                      className="h-10 text-xs bg-surface-raised border-border font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-text-secondary">Destination Target URL *</label>
                      <Input
                        value={formDestinationUrl}
                        onChange={(e) => setFormDestinationUrl(e.target.value)}
                        required
                        placeholder="https://sponsor.com/landing"
                        className="h-10 text-xs bg-surface-raised border-border font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-text-secondary">Call to Action (CTA) Button Text</label>
                      <Input
                        value={formCtaText}
                        onChange={(e) => setFormCtaText(e.target.value)}
                        placeholder="e.g. Upgrade Now"
                        className="h-10 text-xs bg-surface-raised border-border"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: PLACEMENT */}
              {activeFormSection === "placement" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-text-secondary">Target Placement Location *</label>
                    <select
                      value={formPlacementKey}
                      onChange={(e) => setFormPlacementKey(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-bold"
                    >
                      {PLACEMENT_OPTIONS.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.label} ({p.key})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-text-secondary">Associate with Ad Campaign (Optional)</label>
                    <select
                      value={formCampaignId}
                      onChange={(e) => setFormCampaignId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-medium"
                    >
                      <option value="">Standalone (No Campaign)</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* SECTION: SCHEDULE */}
              {activeFormSection === "schedule" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-text-secondary">Start Schedule Time</label>
                    <Input
                      type="datetime-local"
                      value={formStartAt}
                      onChange={(e) => setFormStartAt(e.target.value)}
                      className="h-10 text-xs bg-surface-raised border-border"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-text-secondary">End Schedule Time</label>
                    <Input
                      type="datetime-local"
                      value={formEndAt}
                      onChange={(e) => setFormEndAt(e.target.value)}
                      className="h-10 text-xs bg-surface-raised border-border"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: TARGETING */}
              {activeFormSection === "targeting" && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Target Device Category</label>
                  <select
                    value={formTargetDevice}
                    onChange={(e) => setFormTargetDevice(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-bold"
                  >
                    <option value="all">All Devices (Desktop + Mobile)</option>
                    <option value="desktop">Desktop Only</option>
                    <option value="mobile">Mobile Only</option>
                  </select>
                </div>
              )}

              {/* SECTION: DELIVERY */}
              {activeFormSection === "delivery" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-text-secondary">Priority (1 = Highest)</label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={formPriority}
                        onChange={(e) => setFormPriority(Number(e.target.value))}
                        className="h-10 text-xs bg-surface-raised border-border font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-text-secondary">Frequency Cap (Max / Session)</label>
                      <Input
                        type="number"
                        min={1}
                        value={formMaxPerSession}
                        onChange={(e) => setFormMaxPerSession(Number(e.target.value))}
                        className="h-10 text-xs bg-surface-raised border-border font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-text-secondary">Delivery Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as AdStatus)}
                      className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-bold"
                    >
                      <option value="active">Active (Eligible for Public Delivery)</option>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="paused">Paused</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              )}

              {/* SECTION: PREVIEW */}
              {activeFormSection === "preview" && (
                <div className="space-y-3 p-4 rounded-xl bg-surface-raised/40 border border-border">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Live Placement Preview ({formPlacementKey})</span>
                    <span className="text-[10px] font-bold text-amber-400 uppercase">Preview Mode (No Impression Counted)</span>
                  </div>
                  <AdRenderer
                    creative={{
                      id: "preview-id",
                      title: formTitle || "Preview Ad Title",
                      type: formType,
                      mediaUrl: formMediaUrl || "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200",
                      destinationUrl: formDestinationUrl || "#",
                      ctaText: formCtaText || "Learn More",
                    }}
                    placementKey={formPlacementKey}
                  />
                </div>
              )}

              {/* Footer Save Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="cinematic" disabled={isSubmitting} className="h-9 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>{editingId ? "Update Advertisement" : "Publish Advertisement"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-red-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-extrabold text-text-primary">
                Delete Advertisement &quot;{deletingAd.name}&quot;?
              </h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              This advertisement will be permanently removed. Public placements using this creative will automatically fallback to default system sponsors.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeletingAd(null)} disabled={isDeleting} className="h-9 text-xs">
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteAd} disabled={isDeleting} className="h-9 text-xs gap-1.5">
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
