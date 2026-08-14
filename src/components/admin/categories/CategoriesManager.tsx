"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at?: string;
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = "/api/admin/categories";
      if (searchQuery.trim()) {
        url += `?search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast.error("Could not load categories.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, [searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormSortOrder(categories.length);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CategoryItem) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormSlug(item.slug);
    setFormDescription(item.description || "");
    setFormSortOrder(item.sort_order || 0);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingId) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormSlug(generatedSlug);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) {
      toast.error("Name and slug are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim(),
        description: formDescription.trim(),
        sort_order: Number(formSortOrder),
      };

      const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save category.");
      }

      toast.success(editingId ? "Category updated!" : "Category created!");
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save category.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not delete category.");
      }

      toast.success("Category deleted.");
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete category.";
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
            <Grid className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary">
              Categories Management
            </h1>
            <p className="text-xs text-text-muted">
              Organize catalog items into featured categories, navigation tags, and homepage rails.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          variant="cinematic"
          className="h-10 text-xs gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Toolbar Filter */}
      <div className="p-4 rounded-xl bg-surface-base border border-border flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="pl-9 h-9 text-xs bg-surface-raised border-border"
          />
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border space-y-3">
          <Grid className="h-10 w-10 text-text-muted mx-auto" />
          <h3 className="text-sm font-bold text-text-primary">No Categories Found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {searchQuery
              ? "No categories match your search query."
              : "No categories created yet. Click 'Add Category' to create one."}
          </p>
          <Button
            onClick={handleOpenCreateModal}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-border"
          >
            Create Category
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
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">URL Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-raised/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-purple-400">
                      #{item.sort_order}
                    </td>
                    <td className="py-3 px-4 font-bold text-text-primary">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {item.slug}
                    </td>
                    <td className="py-3 px-4 text-text-muted truncate max-w-xs">
                      {item.description || "No description specified"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditModal(item)}
                          className="h-8 w-8 text-text-muted hover:text-text-primary"
                          title="Edit Category"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingCategory(item)}
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          title="Delete Category"
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
            {categories.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-surface-base border border-border shadow-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-text-primary">
                    {item.name}
                  </h4>
                  <span className="font-mono text-[10px] font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                    Order #{item.sort_order}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-text-muted">
                  /{item.slug}
                </p>
                {item.description && (
                  <p className="text-xs text-text-secondary">
                    {item.description}
                  </p>
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
                    onClick={() => setDeletingCategory(item)}
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

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-purple-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                <Grid className="h-4 w-4 text-purple-400" />
                {editingId ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Category Name *</label>
                <Input
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  placeholder="e.g. Blockbusters"
                  className="h-10 text-xs bg-surface-raised border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">URL Slug *</label>
                <Input
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  required
                  placeholder="blockbusters"
                  className="h-10 text-xs bg-surface-raised border-border font-mono"
                />
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

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Category description..."
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
                  <span>{editingId ? "Update Category" : "Create Category"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-red-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-extrabold text-text-primary">
                Delete Category &quot;{deletingCategory.name}&quot;?
              </h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Are you sure you want to delete category <strong className="text-text-primary">&quot;{deletingCategory.name}&quot;</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingCategory(null)}
                disabled={isDeleting}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteCategory}
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
