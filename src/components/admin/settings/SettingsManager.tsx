"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Loader2,
  Globe,
  ShieldAlert,
  Bot,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function SettingsManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [siteName, setSiteName] = useState("PRO ACCESS MOVIE");
  const [siteDescription, setSiteDescription] = useState("Premium Banglalink & Global Movie & TV Series Streaming Platform.");
  const [defaultLanguage, setDefaultLanguage] = useState("bn");
  const [aiModel, setAiModel] = useState("deepseek/deepseek-r1-distill-llama-70b");
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [enableDownloads, setEnableDownloads] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchInit = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          const s = data.settings || {};
          if (!active) return;
          if (s.site_name) setSiteName(String(s.site_name));
          if (s.site_description) setSiteDescription(String(s.site_description));
          if (s.default_language) setDefaultLanguage(String(s.default_language));
          if (s.ai_default_model) setAiModel(String(s.ai_default_model));
          if (s.enable_registration !== undefined) setEnableRegistration(Boolean(s.enable_registration));
          if (s.enable_downloads !== undefined) setEnableDownloads(Boolean(s.enable_downloads));
          if (s.maintenance_mode !== undefined) setMaintenanceMode(Boolean(s.maintenance_mode));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchInit();
    return () => {
      active = false;
    };
  }, []);

  const handleSaveSetting = async (key: string, value: unknown) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      return res.ok;
    } catch (err) {
      console.error(`Failed to save setting ${key}:`, err);
      return false;
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await Promise.all([
        handleSaveSetting("site_name", siteName),
        handleSaveSetting("site_description", siteDescription),
        handleSaveSetting("default_language", defaultLanguage),
        handleSaveSetting("ai_default_model", aiModel),
        handleSaveSetting("enable_registration", enableRegistration),
        handleSaveSetting("enable_downloads", enableDownloads),
        handleSaveSetting("maintenance_mode", maintenanceMode),
      ]);
      toast.success("All platform settings updated and persisted to database!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save settings.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-base border border-border shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary">
              Global System Settings
            </h1>
            <p className="text-xs text-text-muted">
              Configure branding, OpenRouter AI models, maintenance triggers, and platform features.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSaveAll}
          disabled={isSaving || isLoading}
          variant="cinematic"
          className="h-10 text-xs gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Changes</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center rounded-2xl bg-surface-base border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading settings from database...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveAll} className="space-y-6">
          {/* General Platform Settings */}
          <div className="p-5 rounded-2xl bg-surface-base border border-border shadow-xl space-y-4">
            <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Globe className="h-4 w-4 text-purple-400" /> Platform Identity & Localization
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Platform Title</label>
                <Input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  required
                  className="h-10 text-xs bg-surface-raised border-border font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Default Interface Language</label>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-bold"
                >
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-text-secondary">Meta Description</label>
              <textarea
                rows={2}
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-raised border border-border text-text-primary focus:outline-none"
              />
            </div>
          </div>

          {/* AI Settings */}
          <div className="p-5 rounded-2xl bg-surface-base border border-border shadow-xl space-y-4">
            <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Bot className="h-4 w-4 text-purple-400" /> OpenRouter AI Default Model
            </h3>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-text-secondary">Default OpenRouter LLM Model</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface-raised border border-border text-text-primary font-mono font-bold"
              >
                <option value="deepseek/deepseek-r1-distill-llama-70b">
                  deepseek/deepseek-r1-distill-llama-70b (Default - Fast & High Quality)
                </option>
                <option value="meta-llama/llama-3.3-70b-instruct">
                  meta-llama/llama-3.3-70b-instruct
                </option>
                <option value="qwen/qwen-2.5-72b-instruct">
                  qwen/qwen-2.5-72b-instruct
                </option>
              </select>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="p-5 rounded-2xl bg-surface-base border border-border shadow-xl space-y-4">
            <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Sliders className="h-4 w-4 text-purple-400" /> Feature Flags & Security Toggles
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised/40 border border-border">
                <div>
                  <p className="font-bold text-text-primary">Enable Direct Downloads</p>
                  <p className="text-[11px] text-text-muted">Allow users to access direct download source links.</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableDownloads}
                  onChange={(e) => setEnableDownloads(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-purple-600 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised/40 border border-border">
                <div>
                  <p className="font-bold text-text-primary">Allow Public User Registration</p>
                  <p className="text-[11px] text-text-muted">Permit new viewers to sign up for accounts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableRegistration}
                  onChange={(e) => setEnableRegistration(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-purple-600 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                  <div>
                    <p className="font-bold text-red-400">Maintenance Mode</p>
                    <p className="text-[11px] text-text-muted">Lock platform public access for emergency upgrades.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-red-600 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              variant="cinematic"
              className="h-10 text-xs gap-2 bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>Save System Settings</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
