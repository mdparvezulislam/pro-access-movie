"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  AlertTriangle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CollectionItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  featured: boolean;
  sort_order: number;
  created_at?: string;
}

export function CollectionsManager() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("draft");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deletingCollection, setDeletingCollection] = useState<CollectionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/collections?status=${selectedStatus}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections || []);
      }
    } catch (err) {
      console.error("Failed to fetch collections:", err);
      toast.error("Could not load collections.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormTitle("");
    setFormSlug("");
    setFormDescription("");
    setFormStatus("draft");
    setFormFeatured(false);
    setFormSortOrder(collections.length);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CollectionItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormSlug(item.slug);
    setFormDescription(item.description || "");
    setFormStatus(item.status || "draft");
    setFormFeatured(Boolean(item.featured));
    setFormSortOrder(item.sort_order || 0);
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingId) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormSlug(generatedSlug);
    }
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSlug.trim()) {
      toast.error("Title and slug are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formTitle.trim(),
        slug: formSlug.trim(),
        description: formDescription.trim(),
        status: formStatus,
        featured: formFeatured,
        sort_order: Number(formSortOrder),
      };

      const url = editingId ? `/api/admin/collections/${editingId}` : "/api/admin/collections";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save collection.");
      }

      toast.success(editingId ? "Collection updated!" : "Collection created!");
      setIsModalOpen(false);
      fetchCollections();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save collection.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!deletingCollection) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/collections/${deletingCollection.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not delete collection.");
      }

      toast.success("Collection deleted.");
      setDeletingCollection(null);
      fetchCollections();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete collection.";
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
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary">
              Collections Management
            </h1>
            <p className="text-xs text-text-muted">
              Curate thematic movie and series collections, homepage spotlight rails, and franchise groups.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          variant="cinematic"
          className="h-10 text-xs gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add Collection</span>
        </Button>
      </div>

      {/* Toolbar Filter */}
      <div className="p-4 rounded-xl bg-surface-base border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections by title or slug..."
            className="pl-9 h-9 text-xs bg-surface-raised border-border"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted whitespace-nowrap">
            Status:
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text-primary"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading collections...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border space-y-3">
          <FolderKanban className="h-10 w-10 text-text-muted mx-auto" />
          <h3 className="text-sm font-bold text-text-primary">No Collections Found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {searchQuery || selectedStatus !== "all"
              ? "No collections match your active filter."
              : "No collections created yet. Click 'Add Collection' to curate your first playlist."}
          </p>
          <Button
            onClick={handleOpenCreateModal}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-border"
          >
            Create Collection
          </Button>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block rounded-2xl bg-surface-base border border-border shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised/60 text-text-muted font-bold border-b border-border uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Collection Title</th>
                  <th className="py-3 px-4">URL Slug</th>
                  <th className="py-3 px-4">Spotlight</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {collections.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-raised/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-purple-400">
                      #{item.sort_order}
                    </td>
                    <td className="py-3 px-4 font-bold text-text-primary">
                      {item.title}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {item.slug}
                    </td>
                    <td className="py-3 px-4">
                      {item.featured ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-max">
                          <Star className="h-3 w-3 fill-amber-400" /> Featured Rail
                        </span>
                      ) : (
                        <span className="text-text-muted text-[11px]">Standard</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
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
                          title="Edit Collection"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingCollection(item)}
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          title="Delete Collection"
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

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-3">
            {collections.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-surface-base border border-border shadow-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-text-primary">
                    {item.title}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === "published"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-text-muted">
                  /{item.slug}
                </p>
                {item.featured && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400" /> Featured Rail
                  </span>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditModal(item)}
                    className="h-8 text-xs gap-1 border-border"
                  >
                    <Edit className="h-3 w-3" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingCollection(item)}
                    className="h-8 text-xs gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CREATE / EDIT COLLECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-purple-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-purple-400" />
                {editingId ? "Edit Collection" : "Create New Collection"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Collection Title *</label>
                <Input
                  value={formTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  placeholder="e.g. Eid Specials 2026"
                  className="h-10 text-xs bg-surface-raised border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">URL Slug *</label>
                <Input
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  required
                  placeholder="eid-specials-2026"
                  className="h-10 text-xs bg-surface-raised border-border font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Catalog Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-bold"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Sort Order</label>
                  <Input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="h-10 text-xs bg-surface-raised border-border font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-raised/40 border border-border/80">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="featuredToggle" className="font-semibold text-text-primary cursor-pointer select-none">
                  Promote to Featured Homepage Rail
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Collection summary..."
                  className="w-full p-3 rounded-xl bg-surface-raised border border-border text-text-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="cinematic"
                  disabled={isSubmitting}
                  className="h-9 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>{editingId ? "Update Collection" : "Create Collection"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-red-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-extrabold text-text-primary">
                Delete Collection &quot;{deletingCollection.title}&quot;?
              </h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Are you sure you want to delete collection <strong className="text-text-primary">&quot;{deletingCollection.title}&quot;</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingCollection(null)}
                disabled={isDeleting}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteCollection}
                disabled={isDeleting}
                className="h-9 text-xs gap-1.5"
              >
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
