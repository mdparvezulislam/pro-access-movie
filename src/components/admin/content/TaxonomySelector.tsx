"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Tag, Folder, Bookmark, Search, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TaxonomyItem {
  id: string;
  name?: string;
  title?: string;
  slug: string;
}

interface TaxonomySelectorProps {
  label: string;
  icon: "tag" | "folder" | "bookmark";
  type: "categories" | "genres" | "collections";
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TaxonomySelector({
  label,
  icon,
  type,
  selectedIds,
  onChange,
}: TaxonomySelectorProps) {
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/admin/${type}`);
      if (res.ok) {
        const data = await res.json();
        const list: TaxonomyItem[] = data[type] || data.data || [];
        setItems(list);
      }
    } catch (err) {
      console.error(`Failed to fetch ${type}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type]);

  const getIcon = () => {
    if (icon === "folder") return <Folder className="h-4 w-4 text-purple-400" />;
    if (icon === "bookmark") return <Bookmark className="h-4 w-4 text-amber-400" />;
    return <Tag className="h-4 w-4 text-red-400" />;
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const availableItems = items.filter(
    (item) =>
      !selectedIds.includes(item.id) &&
      (item.name || item.title || "").toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter((item) => item !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
          {getIcon()}
          <span>{label}</span>
          <span className="text-[10px] text-text-muted font-mono">({selectedIds.length})</span>
        </label>
      </div>

      {/* Selected Pill Badges Container */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-surface-raised border border-border min-h-[44px]">
        {selectedItems.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-sm"
          >
            <span>{item.name || item.title}</span>
            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              className="p-0.5 rounded hover:bg-purple-500/20 text-purple-400 hover:text-purple-200 transition"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {/* Trigger Add Dropdown Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-surface-base hover:bg-surface-raised text-text-primary border border-border transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add {label.slice(0, -1)}</span>
          </button>

          {/* Dropdown Popover */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-64 rounded-xl bg-surface-base border border-border shadow-2xl z-30 p-2 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-muted" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Filter ${type}...`}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-raised border border-border text-xs text-text-primary focus:outline-none"
                />
              </div>

              <div className="max-h-48 overflow-y-auto divide-y divide-border/40">
                {isLoading ? (
                  <div className="p-3 text-center text-xs text-text-muted flex items-center justify-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
                  </div>
                ) : availableItems.length === 0 ? (
                  <div className="p-3 text-center text-xs text-text-muted">No items available.</div>
                ) : (
                  availableItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleToggle(item.id);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-raised rounded-md transition flex items-center justify-between"
                    >
                      <span>{item.name || item.title}</span>
                      <Plus className="h-3 w-3 text-text-muted" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
