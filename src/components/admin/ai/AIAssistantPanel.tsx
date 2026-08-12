"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  CheckCircle2,
  RefreshCw,
  X,
  FileText,
  Search,
  Tag,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIOperation, TargetLanguage } from "@/types/ai";
import { toast } from "sonner";

interface AIAssistantPanelProps {
  title: string;
  releaseYear?: number;
  existingDescription?: string;
  existingDescriptionBn?: string;
  existingGenres?: string[];
  contentId?: string;
  contentType?: "movie" | "series" | "episode";
  onApplyDescription?: (descEn: string, descBn: string, tagline?: string) => void;
  onApplySeo?: (seoTitle: string, seoDesc: string, keywords: string[]) => void;
  onApplyClassification?: (genres: string[], rating: string) => void;
}

function getStr(obj: Record<string, unknown> | null, key: string): string {
  return typeof obj?.[key] === "string" ? (obj[key] as string) : "";
}

function getArr(obj: Record<string, unknown> | null, key: string): string[] {
  return Array.isArray(obj?.[key]) ? (obj[key] as string[]) : [];
}

export function AIAssistantPanel({
  title,
  releaseYear,
  existingDescription = "",
  existingDescriptionBn = "",
  existingGenres = [],
  contentId,
  contentType = "movie",
  onApplyDescription,
  onApplySeo,
  onApplyClassification,
}: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<AIOperation>("generate_description");
  const [language, setLanguage] = useState<TargetLanguage>("bn");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);
  const [isMockFallback, setIsMockFallback] = useState(false);

  const handleGenerate = async (op: AIOperation = activeTab) => {
    setIsGenerating(true);
    setAiResult(null);

    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: op,
          title,
          releaseYear,
          existingDescription,
          genres: existingGenres,
          targetLanguage: language,
          contentId,
          contentType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "AI generation failed.");
      }

      setAiResult(data.data);
      setIsMockFallback(Boolean(data.isMockFallback));
      toast.success(
        data.isMockFallback
          ? "Generated AI suggestion (Demo Fallback Mode)."
          : "Generated AI suggestion via OpenRouter."
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate AI content.";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!aiResult) return;

    if (activeTab === "generate_description" || activeTab === "localize_bengali") {
      if (onApplyDescription) {
        onApplyDescription(
          getStr(aiResult, "description") || existingDescription,
          getStr(aiResult, "descriptionBn") || existingDescriptionBn,
          getStr(aiResult, "tagline")
        );
      }
      toast.success("Applied AI description suggestions to editor!");
    } else if (activeTab === "generate_seo") {
      if (onApplySeo) {
        onApplySeo(
          getStr(aiResult, "seoTitle"),
          getStr(aiResult, "seoDescription"),
          getArr(aiResult, "keywords")
        );
      }
      toast.success("Applied AI SEO metadata to editor!");
    } else if (activeTab === "suggest_classification") {
      if (onApplyClassification) {
        onApplyClassification(
          getArr(aiResult, "suggestedGenres"),
          getStr(aiResult, "contentRating") || "13+"
        );
      }
      toast.success("Applied AI genres & rating classification!");
    }

    setAiResult(null);
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-base border border-border shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/30">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-text-primary">
                OpenRouter AI Content Assistant
              </h3>
              {isMockFallback && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted">
              Enrich descriptions, Bengali localization, SEO metadata, and genres with structured AI verification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as TargetLanguage)}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text-primary focus:outline-none"
          >
            <option value="bn">Bengali (বাংলা)</option>
            <option value="en font-medium">English</option>
            <option value="banglish">Banglish</option>
          </select>
        </div>
      </div>

      {/* Operation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => { setActiveTab("generate_description"); setAiResult(null); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            activeTab === "generate_description"
              ? "bg-purple-600 text-white font-bold shadow-md"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Descriptions & Taglines
        </button>

        <button
          onClick={() => { setActiveTab("generate_seo"); setAiResult(null); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            activeTab === "generate_seo"
              ? "bg-purple-600 text-white font-bold shadow-md"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
          }`}
        >
          <Search className="h-3.5 w-3.5" />
          SEO & Keywords
        </button>

        <button
          onClick={() => { setActiveTab("suggest_classification"); setAiResult(null); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            activeTab === "suggest_classification"
              ? "bg-purple-600 text-white font-bold shadow-md"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          Genres & Classification
        </button>
      </div>

      {/* Action Trigger */}
      {!aiResult && (
        <div className="p-6 rounded-xl bg-surface-raised border border-border text-center space-y-3">
          <Sparkles className="h-8 w-8 text-purple-400 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-text-primary">
              Generate {activeTab.replace("_", " ")} for &quot;{title}&quot;
            </h4>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              AI suggestions use strict Zod schemas and require admin approval before saving.
            </p>
          </div>

          <Button
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            variant="cinematic"
            className="h-9 text-xs gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{isGenerating ? "Analyzing & Generating..." : "Generate AI Suggestions"}</span>
          </Button>
        </div>
      )}

      {/* AI Suggestion Diff & Review Card */}
      {aiResult && (
        <div className="space-y-4 p-5 rounded-xl bg-purple-950/20 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                AI Suggestion Review
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAiResult(null)}
                className="h-7 text-xs text-text-muted hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="h-7 text-xs gap-1 border-purple-500/30 text-purple-300"
              >
                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                Regenerate
              </Button>
            </div>
          </div>

          {/* Result Content Details */}
          {activeTab === "generate_description" && (
            <div className="space-y-3 text-xs">
              {getStr(aiResult, "descriptionBn") && (
                <div className="space-y-1 bg-surface-base p-3 rounded-lg border border-border">
                  <span className="font-bold text-red-400 uppercase text-[10px]">Bengali Description (বাংলা)</span>
                  <p className="text-text-primary leading-relaxed font-bangla">{getStr(aiResult, "descriptionBn")}</p>
                </div>
              )}

              {getStr(aiResult, "description") && (
                <div className="space-y-1 bg-surface-base p-3 rounded-lg border border-border">
                  <span className="font-bold text-text-muted uppercase text-[10px]">English Description</span>
                  <p className="text-text-secondary leading-relaxed">{getStr(aiResult, "description")}</p>
                </div>
              )}

              {getStr(aiResult, "tagline") && (
                <div className="text-[11px] italic text-purple-300">
                  Tagline: &quot;{getStr(aiResult, "tagline")}&quot;
                </div>
              )}
            </div>
          )}

          {activeTab === "generate_seo" && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1 bg-surface-base p-3 rounded-lg border border-border">
                <span className="font-bold text-text-muted uppercase text-[10px]">SEO Title</span>
                <p className="font-bold text-text-primary">{getStr(aiResult, "seoTitle")}</p>
              </div>

              <div className="space-y-1 bg-surface-base p-3 rounded-lg border border-border">
                <span className="font-bold text-text-muted uppercase text-[10px]">Meta Description</span>
                <p className="text-text-secondary">{getStr(aiResult, "seoDescription")}</p>
              </div>

              {getArr(aiResult, "keywords").length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {getArr(aiResult, "keywords").map((kw: string) => (
                    <span key={kw} className="px-2 py-0.5 rounded bg-purple-900/40 text-purple-200 text-[10px] border border-purple-500/30">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "suggest_classification" && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-muted">Content Rating:</span>
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-xs">
                  {getStr(aiResult, "contentRating") || "13+"}
                </span>
                {getStr(aiResult, "ageRatingReason") && (
                  <span className="text-text-muted italic">({getStr(aiResult, "ageRatingReason")})</span>
                )}
              </div>

              {getArr(aiResult, "suggestedGenres").length > 0 && (
                <div className="space-y-1">
                  <span className="font-bold text-text-muted uppercase text-[10px]">Suggested Genres</span>
                  <div className="flex flex-wrap gap-1.5">
                    {getArr(aiResult, "suggestedGenres").map((g: string) => (
                      <span key={g} className="px-2.5 py-1 rounded bg-surface-base text-text-primary border border-border text-xs font-semibold">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Accept & Apply Button */}
          <div className="pt-2 flex justify-end">
            <Button
              onClick={handleApply}
              variant="cinematic"
              className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Accept & Apply to Form</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
