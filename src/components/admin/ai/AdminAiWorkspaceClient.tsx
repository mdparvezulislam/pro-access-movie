"use client";

import React, { useState } from "react";
import { Sparkles, Bot, Check, X, RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiResultData {
  titleBn?: string;
  overviewEn?: string;
  overviewBn?: string;
  seoTitle?: string;
  keywords?: string[];
}

export function AdminAiWorkspaceClient() {
  const [title, setTitle] = useState("Hawa");
  const [overview, setOverview] = useState("A group of fishermen find a mysterious young woman in their net in the middle of the deep sea.");
  const [selectedOperation, setSelectedOperation] = useState("generate_description");
  const [language, setLanguage] = useState("bengali");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResultData | null>(null);
  const [accepted, setAccepted] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setAccepted(false);

    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          overview,
          operation: selectedOperation,
          targetLanguage: language,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.data || data);
      } else {
        alert(data.error || "AI Generation failed");
      }
    } catch (err) {
      console.error("AI workspace generation error:", err);
      alert("Failed to call AI assistant API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 rounded-3xl bg-surface-base border border-border shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-400" /> Interactive AI Content Assistant
          </h2>
          <p className="text-xs text-text-muted">
            Generate Bengali descriptions, SEO tags, short summaries, and clean raw imported metadata using server-side OpenRouter models.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Form Column */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-text-muted block mb-1">Movie / Series Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hawa, Karagar, Surrender"
              className="w-full p-3 rounded-xl bg-surface-raised border border-border text-sm font-bold text-text-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text-muted block mb-1">Raw Overview / Synopsis</label>
            <textarea
              rows={4}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="Paste TMDB or raw overview text..."
              className="w-full p-3 rounded-xl bg-surface-raised border border-border text-xs text-text-secondary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-text-muted block mb-1">AI Operation</label>
              <select
                value={selectedOperation}
                onChange={(e) => setSelectedOperation(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-raised border border-border text-xs text-text-primary focus:outline-none"
              >
                <option value="generate_description">Generate Descriptions</option>
                <option value="generate_seo">Generate SEO Metadata</option>
                <option value="localize_bengali">Localize Bengali Metadata</option>
                <option value="enhance_text">Clean & Improve Text</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-text-muted block mb-1">Target Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-raised border border-border text-xs text-text-primary focus:outline-none"
              >
                <option value="bengali">Bangla (বাংলা)</option>
                <option value="english">English</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            variant="cinematic"
            className="w-full py-3 gap-2"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            <span>{loading ? "Generating with OpenRouter..." : "Generate AI Metadata"}</span>
          </Button>
        </div>

        {/* Right Output Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" /> AI Draft Result
          </h3>

          {!result && !loading && (
            <div className="h-64 rounded-2xl bg-surface-raised/40 border border-border border-dashed flex flex-col items-center justify-center p-6 text-center text-text-muted space-y-2">
              <Bot className="h-10 w-10 text-text-muted opacity-40" />
              <p className="text-xs">Click Generate AI Metadata to preview OpenRouter output.</p>
            </div>
          )}

          {loading && (
            <div className="h-64 rounded-2xl bg-surface-raised/40 border border-border flex flex-col items-center justify-center p-6 text-center space-y-3">
              <RefreshCw className="h-8 w-8 text-purple-400 animate-spin" />
              <p className="text-xs font-bold text-text-primary">Processing via OpenRouter Server Gateway...</p>
            </div>
          )}

          {result && !loading && (
            <div className="p-5 rounded-2xl bg-surface-raised border border-purple-500/20 space-y-4 shadow-xl">
              {accepted ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <Check className="h-4 w-4" /> AI Metadata Accepted & Applied to Draft!
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                  <span>OpenRouter Output</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">Draft Pending Approval</span>
                </div>
              )}

              <div className="space-y-2 text-xs">
                {result.titleBn && (
                  <div>
                    <span className="font-bold text-text-muted">Bangla Title:</span>
                    <p className="font-semibold text-red-400 text-sm">{result.titleBn}</p>
                  </div>
                )}

                {result.overviewEn && (
                  <div>
                    <span className="font-bold text-text-muted">English Description:</span>
                    <p className="text-text-secondary">{result.overviewEn}</p>
                  </div>
                )}

                {result.overviewBn && (
                  <div>
                    <span className="font-bold text-text-muted">Bangla Description:</span>
                    <p className="text-text-secondary">{result.overviewBn}</p>
                  </div>
                )}

                {result.seoTitle && (
                  <div>
                    <span className="font-bold text-text-muted">SEO Title:</span>
                    <p className="text-text-primary font-mono">{result.seoTitle}</p>
                  </div>
                )}

                {result.keywords && Array.isArray(result.keywords) && (
                  <div>
                    <span className="font-bold text-text-muted">Keywords:</span>
                    <p className="text-text-muted font-mono">{result.keywords.join(", ")}</p>
                  </div>
                )}
              </div>

              {!accepted && (
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <Button onClick={() => setAccepted(true)} size="sm" variant="cinematic" className="gap-1.5 flex-1">
                    <Check className="h-4 w-4" /> Accept Draft
                  </Button>
                  <Button onClick={() => setResult(null)} size="sm" variant="ghost" className="gap-1.5">
                    <X className="h-4 w-4" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
