"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Shield,
  Loader2,
  X,
  Edit,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface UserItem {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  roles: string[];
  created_at: string;
}

export function UsersManager() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [selectedRole, setSelectedRole] = useState("user");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async (query: string) => {
    setIsLoading(true);
    try {
      let url = "/api/admin/users";
      if (query.trim()) {
        url += `?search=${encodeURIComponent(query.trim())}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Could not load users list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (active) await loadUsers(searchQuery);
    };
    run();
    return () => {
      active = false;
    };
  }, [searchQuery]);

  const handleOpenEditModal = (user: UserItem) => {
    setEditingUser(user);
    setSelectedRole(user.roles[0] || "user");
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role.");

      toast.success(`Role updated to '${selectedRole}'!`);
      setEditingUser(null);
      loadUsers(searchQuery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Role update failed.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-5 rounded-2xl bg-surface-base border border-border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary">
              Users & Roles Management
            </h1>
            <p className="text-xs text-text-muted">
              View user profiles, assign admin/editor authorization privileges, and manage security permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar Search */}
      <div className="p-4 rounded-xl bg-surface-base border border-border flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or ID..."
            className="pl-9 h-9 text-xs bg-surface-raised border-border"
          />
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading platform users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border space-y-3">
          <Users className="h-10 w-10 text-text-muted mx-auto" />
          <h3 className="text-sm font-bold text-text-primary">No Users Found</h3>
          <p className="text-xs text-text-muted">No users match your active search query.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-base border border-border shadow-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-raised/60 text-text-muted font-bold border-b border-border uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-text-primary">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center border border-purple-500/30 text-xs">
                        {(u.display_name || "U")[0].toUpperCase()}
                      </div>
                      <span>{u.display_name || "User"}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-text-muted text-[11px]">
                    {u.id}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        u.roles.includes("super_admin") || u.roles.includes("admin")
                          ? "bg-red-500/10 text-red-400 border border-red-500/30"
                          : u.roles.includes("editor")
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                      }`}
                    >
                      {u.roles.join(", ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-[11px]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditModal(u)}
                      className="h-8 text-xs gap-1 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit Role
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-base border border-purple-500/30 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-400" /> Change User Role
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-text-muted hover:text-text-primary p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-text-muted block">Target User:</span>
                <span className="font-bold text-text-primary block text-sm">
                  {editingUser.display_name || editingUser.id}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Select Authorization Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-bold"
                >
                  <option value="user">User (Standard Audience)</option>
                  <option value="editor">Editor (Content Manager)</option>
                  <option value="admin">Admin (Full Control)</option>
                  <option value="super_admin">Super Admin (System Owner)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setEditingUser(null)} disabled={isSubmitting} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="cinematic" disabled={isSubmitting} className="h-9 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Save Role</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
