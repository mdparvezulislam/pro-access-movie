"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  FileText,
  Search,
  Tag,
  Loader2,
  Wand2,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIOperation, TargetLanguage } from "@/types/ai";
import { toast } from "sonner";
import { AIPreviewModal, PreviewDiffField } from "./AIPreviewModal";

interface AIAssistantPanelProps {
  title: string;
  releaseYear?: number;
  existingDescription?: string;
  existingDescriptionBn?: string;
  existingTagline?: string;
  existingSeoTitle?: string;
  existingSeoDescription?: string;
  existingKeywords?: string[];
  existingGenres?: string[];
  contentId?: string;
  contentType?: "movie" | "series" | "season" | "episode";
  seriesTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  onApplyDescription?: (descEn: string, descBn: string, tagline?: string) => void;
  onApplySeo?: (seoTitle: string, seoDesc: string, keywords: string[], slug?: string) => void;
  onApplyClassification?: (genres: string[], rating: string) => void;
  onApplyCleanedText?: (cleanedText: string) => void;
  onApplyTranslation?: (translatedText: string, targetLang: string) => void;
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
  existingTagline = "",
  existingSeoTitle = "",
  existingSeoDescription = "",
  existingKeywords = [],
  existingGenres = [],
  contentId,
  contentType = "movie",
  seriesTitle,
  seasonNumber,
  episodeNumber,
  onApplyDescription,
  onApplySeo,
  onApplyClassification,
  onApplyCleanedText,
  onApplyTranslation,
}: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<AIOperation>("generate_description");
  const [targetLang, setTargetLang] = useState<TargetLanguage>("bn");
  const [customInstructions, setCustomInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Modal Preview States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);
  const [isMockFallback, setIsMockFallback] = useState(false);
  const [previewFields, setPreviewFields] = useState<PreviewDiffField[]>([]);

  const handleGenerate = async (op: AIOperation = activeTab) => {
    if (!title || title.trim().length === 0) {
      toast.error("Title is required to run AI assistant.");
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: op,
          title,
          releaseYear,
          existingDescription,
          existingDescriptionBn,
          existingText: existingDescriptionBn || existingDescription,
          genres: existingGenres,
          targetLanguage: targetLang,
          contentId,
          contentType,
          seriesTitle,
          seasonNumber,
          episodeNumber,
          customInstructions: customInstructions.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "AI generation failed.");
      }

      const resultData = data.data as Record<string, unknown>;
      setAiResult(resultData);
      setIsMockFallback(Boolean(data.isMockFallback));

      // Build field comparison diffs for preview modal
      const fields: PreviewDiffField[] = [];

      if (op === "generate_description" || op === "improve_description") {
        fields.push(
          {
            label: "Bengali Synopsis (বাংলা)",
            currentValue: existingDescriptionBn,
            suggestedValue: getStr(resultData, "descriptionBn"),
            isBangla: true,
          },
          {
            label: "English Synopsis",
            currentValue: existingDescription,
            suggestedValue: getStr(resultData, "description"),
          },
          {
            label: "Tagline",
            currentValue: existingTagline,
            suggestedValue: getStr(resultData, "tagline"),
          }
        );
      } else if (op === "generate_seo") {
        fields.push(
          {
            label: "SEO Meta Title",
            currentValue: existingSeoTitle,
            suggestedValue: getStr(resultData, "seoTitle"),
          },
          {
            label: "SEO Meta Description",
            currentValue: existingSeoDescription,
            suggestedValue: getStr(resultData, "seoDescription"),
          },
          {
            label: "SEO Keywords",
            currentValue: existingKeywords,
            suggestedValue: getArr(resultData, "keywords"),
          },
          {
            label: "URL Slug Suggestion",
            currentValue: "",
            suggestedValue: getStr(resultData, "suggestedSlug"),
          }
        );
      } else if (op === "suggest_classification") {
        fields.push(
          {
            label: "Suggested Genres",
            currentValue: existingGenres,
            suggestedValue: getArr(resultData, "suggestedGenres"),
          },
          {
            label: "Content Rating",
            currentValue: "13+",
            suggestedValue: getStr(resultData, "contentRating") || "13+",
          }
        );
      } else if (op === "clean_content") {
        fields.push({
          label: "Cleaned Content Text",
          currentValue: existingDescription || existingDescriptionBn || title,
          suggestedValue: getStr(resultData, "cleanedText"),
          isBangla: Boolean(existingDescriptionBn),
        });
      } else if (op === "translate") {
        fields.push({
          label: `Translation (${targetLang === "bn" ? "English ➔ Bengali" : "Bengali ➔ English"})`,
          currentValue: existingDescription || existingDescriptionBn,
          suggestedValue: getStr(resultData, "translatedText"),
          isBangla: targetLang === "bn",
        });
      } else if (op === "generate_episode_summary") {
        fields.push(
          {
            label: "Episode Short Summary",
            currentValue: existingDescription.slice(0, 100),
            suggestedValue: getStr(resultData, "shortSummary"),
          },
          {
            label: "Episode Full Synopsis",
            currentValue: existingDescription,
            suggestedValue: getStr(resultData, "fullSummary"),
          }
        );
      } else if (op === "generate_season_summary") {
        fields.push({
          label: "Season Overview Arc",
          currentValue: existingDescription,
          suggestedValue: getStr(resultData, "seasonOverview"),
        });
      }

      setPreviewFields(fields);
      setIsPreviewOpen(true);
      toast.success(
        data.isMockFallback
          ? "Generated AI suggestions (Demo Fallback Mode)."
          : "Generated AI suggestions via OpenRouter."
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI service is temporarily unavailable.";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPreview = () => {
    if (!aiResult) return;

    if (activeTab === "generate_description" || activeTab === "improve_description") {
      if (onApplyDescription) {
        onApplyDescription(
          getStr(aiResult, "description") || existingDescription,
          getStr(aiResult, "descriptionBn") || existingDescriptionBn,
          getStr(aiResult, "tagline")
        );
      }
      toast.success("Applied AI description to editor!");
    } else if (activeTab === "generate_seo") {
      if (onApplySeo) {
        onApplySeo(
          getStr(aiResult, "seoTitle"),
          getStr(aiResult, "seoDescription"),
          getArr(aiResult, "keywords"),
          getStr(aiResult, "suggestedSlug")
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
      toast.success("Applied AI genres & classification!");
    } else if (activeTab === "clean_content") {
      if (onApplyCleanedText) {
        onApplyCleanedText(getStr(aiResult, "cleanedText"));
      }
      toast.success("Applied cleaned text to editor!");
    } else if (activeTab === "translate") {
      if (onApplyTranslation) {
        onApplyTranslation(getStr(aiResult, "translatedText"), targetLang);
      }
      toast.success("Applied AI translation to editor!");
    } else if (activeTab === "generate_episode_summary" || activeTab === "generate_season_summary") {
      if (onApplyDescription) {
        onApplyDescription(
          getStr(aiResult, "fullSummary") || getStr(aiResult, "seasonOverview"),
          "",
          ""
        );
      }
      toast.success("Applied AI summary to editor!");
    }

    setIsPreviewOpen(false);
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
              Generate localized summaries, SEO metadata, tags, translations, and clean text with admin review before applying.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as TargetLanguage)}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text-primary focus:outline-none"
          >
            <option value="bn">Bengali (বাংলা)</option>
            <option value="en">English</option>
            <option value="banglish">Banglish</option>
          </select>
        </div>
      </div>

      {/* Action Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("generate_description")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            activeTab === "generate_description"
              ? "bg-purple-600 text-white font-bold shadow-md"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Descriptions
        </button>

        <button
          onClick={() => setActiveTab("improve_description")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            activeTab === "improve_description"
              ? "bg-purple-600 text-white font-bold shadow-md"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
          }`}
        >
          <Wand2 className="h-3.5 w-3.5" />
          Improve Content
        </button>

        <button
          onClick={() => setActiveTab("generate_seo")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            activeTab === "generate_seo"
              ? "bg-purple-600 text-white font-bold shadow-md"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
          }`}
        >
          <Search className="h-3.5 w-3.5" />
          SEO & Slug
        </button>

        <button
          onClick={() => setActiveTab("suggest_classification")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            activeTab === "suggest_classification"
              ? "bg-purple-600 text-white font-bold shadow-md"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          Genres & Tags
        </button>

        <button
          onClick={() => setActiveTab("translate")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            activeTab === "translate"
              ? "bg-purple-600 text-white font-bold shadow-md"
              : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
          }`}
        >
          <Languages className="h-3.5 w-3.5" />
          Translate
        </button>

        {contentType === "episode" && (
          <button
            onClick={() => setActiveTab("generate_episode_summary")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              activeTab === "generate_episode_summary"
                ? "bg-purple-600 text-white font-bold shadow-md"
                : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Episode Summary
          </button>
        )}
      </div>

      {/* Prompt Custom Instructions & Trigger Box */}
      <div className="p-5 rounded-xl bg-surface-raised border border-border space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">
            Custom AI Guidance / Tone Instructions (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Make it dramatic, emphasize high-octane action, or keep tone formal..."
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            disabled={isGenerating}
            className="w-full h-9 px-3 rounded-lg text-xs bg-surface-base border border-border text-text-primary focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-text-muted">
            All AI responses undergo Zod validation and require your preview approval.
          </p>

          <Button
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            variant="cinematic"
            className="h-9 text-xs gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating with OpenRouter...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Run {activeTab.replace("_", " ")}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Modal Component */}
      <AIPreviewModal
        isOpen={isPreviewOpen}
        operationTitle={activeTab.replace("_", " ")}
        fields={previewFields}
        isMockFallback={isMockFallback}
        onApply={handleApplyPreview}
        onCancel={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
