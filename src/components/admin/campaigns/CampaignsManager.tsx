"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CampaignItem {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  start_date: string | null;
  end_date: string | null;
  created_at?: string;
}

export function CampaignsManager() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [formName, setFormName] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "paused" | "completed">("active");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [deletingCampaign, setDeletingCampaign] = useState<CampaignItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = "/api/admin/campaigns";
      if (searchQuery.trim()) {
        url += `?search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
      toast.error("Could not load ad campaigns.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormName("");
    setFormStatus("active");
    setFormStartDate("");
    setFormEndDate("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CampaignItem) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormStatus(item.status || "active");
    setFormStartDate(item.start_date ? item.start_date.slice(0, 10) : "");
    setFormEndDate(item.end_date ? item.end_date.slice(0, 10) : "");
    setIsModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Campaign name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        status: formStatus,
        start_date: formStartDate || null,
        end_date: formEndDate || null,
      };

      const url = editingId ? `/api/admin/campaigns/${editingId}` : "/api/admin/campaigns";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save campaign.");

      toast.success(editingId ? "Campaign updated!" : "Campaign created!");
      setIsModalOpen(false);
      fetchCampaigns();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save campaign.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!deletingCampaign) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${deletingCampaign.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete campaign.");

      toast.success("Campaign deleted.");
      setDeletingCampaign(null);
      fetchCampaigns();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete campaign.";
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
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary">
              Ad Campaigns Manager
            </h1>
            <p className="text-xs text-text-muted">
              Schedule, track, and activate advertising campaigns across platform placements.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          variant="cinematic"
          className="h-10 text-xs gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add Campaign</span>
        </Button>
      </div>

      {/* Toolbar Filter */}
      <div className="p-4 rounded-xl bg-surface-base border border-border flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by name..."
            className="pl-9 h-9 text-xs bg-surface-raised border-border"
          />
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border space-y-3">
          <Sparkles className="h-10 w-10 text-text-muted mx-auto" />
          <h3 className="text-sm font-bold text-text-primary">No Campaigns Found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Click 'Add Campaign' to schedule your first sponsor advertising campaign.
          </p>
          <Button onClick={handleOpenCreateModal} size="sm" variant="outline" className="h-8 text-xs border-border">
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-base border border-border shadow-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-raised/60 text-text-muted font-bold border-b border-border uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((item) => (
                <tr key={item.id} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-text-primary">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Calendar className="h-3.5 w-3.5 text-text-muted" />
                      <span>
                        {item.start_date ? item.start_date.slice(0, 10) : "Immediate"}
                        {" ➔ "}
                        {item.end_date ? item.end_date.slice(0, 10) : "Ongoing"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : item.status === "paused"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditModal(item)}
                        className="h-8 w-8 text-text-muted hover:text-text-primary"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCampaign(item)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-purple-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                {editingId ? "Edit Campaign" : "Create Campaign"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Campaign Name *</label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="e.g. Eid Mega Brand Sponsorship"
                  className="h-10 text-xs bg-surface-raised border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "active" | "paused" | "completed")}
                  className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-bold"
                >
                  <option value="active">Active (Running)</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Start Date</label>
                  <Input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="h-10 text-xs bg-surface-raised border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">End Date</label>
                  <Input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="h-10 text-xs bg-surface-raised border-border"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="cinematic" disabled={isSubmitting} className="h-9 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>{editingId ? "Update Campaign" : "Save Campaign"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deletingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-red-500/30 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-extrabold text-text-primary">Delete Campaign?</h3>
            <p className="text-xs text-text-muted">Are you sure you want to delete campaign "{deletingCampaign.name}"?</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeletingCampaign(null)} className="h-9 text-xs">Cancel</Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteCampaign} className="h-9 text-xs">Confirm Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
