"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Download,
  Search,
  Star,
  Eye,
  Trash2,
  Edit3,
  Tv,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SeriesRecord {
  id: string;
  title: string;
  title_bn?: string | null;
  slug: string;
  status: string;
  release_year?: number | null;
  rating?: number | null;
  media?: Record<string, unknown> | null;
}

interface SeriesAdminViewProps {
  seriesList: SeriesRecord[];
}

export function SeriesAdminView({ seriesList: initialSeries }: SeriesAdminViewProps) {
  const [seriesList, setSeriesList] = useState<SeriesRecord[]>(initialSeries);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Duplicate detector map
  const titleCounts: Record<string, number> = {};
  seriesList.forEach((s) => {
    const key = s.title.toLowerCase().trim();
    titleCounts[key] = (titleCounts[key] || 0) + 1;
  });

  const filteredSeries = seriesList.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.title_bn && s.title_bn.includes(searchTerm)) ||
      s.slug.includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredSeries.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/content/series/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Updated status to ${newStatus}`);
        setSeriesList(seriesList.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
      } else {
        toast.error("Failed to update status.");
      }
    } catch {
      toast.error("Error updating series status.");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/content/series/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Deleted ${title}`);
        setSeriesList(seriesList.filter((s) => s.id !== id));
        setSelectedIds(selectedIds.filter((item) => item !== id));
      } else {
        toast.error("Failed to delete TV series.");
      }
    } catch {
      toast.error("Error deleting TV series.");
    }
  };

  const handleBulkStatus = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    setIsUpdating(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/admin/content/series/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      toast.success(`Bulk updated ${selectedIds.length} series to ${newStatus}`);
      setSeriesList(seriesList.map((s) => (selectedIds.includes(s.id) ? { ...s, status: newStatus } : s)));
      setSelectedIds([]);
    } catch {
      toast.error("Bulk update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-surface-base border border-border shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Tv className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-extrabold text-text-primary">TV Series Catalog Management</h1>
          </div>
          <p className="text-xs text-text-muted">
            Manage TV drama series, seasons, episode streaming sources, and publishing status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/import">
            <Button variant="cinematic" size="sm" className="h-9 text-xs gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 border-0">
              <Download className="h-4 w-4" />
              <span>Import via Metadata Engine</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-surface-base border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search TV series title or slug..."
            className="pl-9 h-9 text-xs bg-surface-raised border-border"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["all", "published", "draft", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? "bg-blue-600 text-white font-bold"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Items Bulk Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs">
          <span className="font-bold text-purple-300">{selectedIds.length} series selected</span>
          <div className="flex items-center gap-2">
            <Button onClick={() => handleBulkStatus("published")} disabled={isUpdating} size="sm" variant="outline" className="h-7 text-xs border-emerald-500/30 text-emerald-400">
              Bulk Publish
            </Button>
            <Button onClick={() => handleBulkStatus("draft")} disabled={isUpdating} size="sm" variant="outline" className="h-7 text-xs border-amber-500/30 text-amber-400">
              Bulk Draft
            </Button>
            <Button onClick={() => handleBulkStatus("archived")} disabled={isUpdating} size="sm" variant="outline" className="h-7 text-xs border-zinc-500/30 text-zinc-400">
              Bulk Archive
            </Button>
          </div>
        </div>
      )}

      {/* Series Table */}
      <div className="rounded-xl border border-border bg-surface-base overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-raised font-bold uppercase tracking-wider text-text-muted border-b border-border">
              <tr>
                <th className="p-4 w-10 text-center">
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredSeries.length && filteredSeries.length > 0} className="rounded accent-blue-600 cursor-pointer" />
                </th>
                <th className="p-4">Series Title</th>
                <th className="p-4">Year</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSeries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    No TV Series found matching filters.
                  </td>
                </tr>
              ) : (
                filteredSeries.map((s) => {
                  const posterUrl =
                    (typeof s.media?.posterUrl === "string" && s.media.posterUrl) ||
                    (typeof s.media?.posterPath === "string" && s.media.posterPath) ||
                    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400";

                  const isDuplicate = (titleCounts[s.title.toLowerCase().trim()] || 0) > 1;

                  return (
                    <tr key={s.id} className="hover:bg-surface-raised/40 transition-colors">
                      <td className="p-4 text-center">
                        <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => handleToggleSelect(s.id)} className="rounded accent-blue-600 cursor-pointer" />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-8 rounded overflow-hidden bg-surface-raised shrink-0 border border-border">
                            <Image src={posterUrl} alt={s.title} fill className="object-cover" unoptimized />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-text-primary text-sm">
                                {s.title} {s.title_bn && <span className="text-blue-400 font-normal">({s.title_bn})</span>}
                              </p>
                              {isDuplicate && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" /> Duplicate Title
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-text-muted font-mono">{s.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-text-secondary">{s.release_year || "N/A"}</td>
                      <td className="p-4 font-bold text-amber-400">
                        {s.rating ? (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {s.rating}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-4">
                        <select
                          value={s.status}
                          onChange={(e) => handleUpdateStatus(s.id, e.target.value)}
                          className="px-2 py-1 rounded bg-surface-raised border border-border text-xs font-bold text-text-primary"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/series/${s.slug}`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-text-primary" title="View Public Page">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/series/${s.id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-border">
                              <Edit3 className="h-3.5 w-3.5" /> Seasons & Episodes
                            </Button>
                          </Link>
                          <Button onClick={() => handleDelete(s.id, s.title)} variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
