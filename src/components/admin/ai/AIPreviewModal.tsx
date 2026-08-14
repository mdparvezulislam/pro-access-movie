"use client";

import React from "react";
import {
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PreviewDiffField {
  label: string;
  currentValue: string | string[];
  suggestedValue: string | string[];
  isBangla?: boolean;
}

interface AIPreviewModalProps {
  isOpen: boolean;
  operationTitle: string;
  fields: PreviewDiffField[];
  isMockFallback?: boolean;
  onApply: () => void;
  onCancel: () => void;
}

export function AIPreviewModal({
  isOpen,
  operationTitle,
  fields,
  isMockFallback = false,
  onApply,
  onCancel,
}: AIPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-surface-base border border-purple-500/30 shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-text-primary">
                  AI Suggestion Preview
                </h3>
                {isMockFallback && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted">
                Review <span className="text-purple-300 font-semibold">{operationTitle}</span>. Compare current values with AI suggestions before applying.
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Diff Comparison Body */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {fields.map((field, idx) => {
            const currentStr = Array.isArray(field.currentValue)
              ? field.currentValue.join(", ")
              : field.currentValue;
            const suggestedStr = Array.isArray(field.suggestedValue)
              ? field.suggestedValue.join(", ")
              : field.suggestedValue;

            return (
              <div key={idx} className="space-y-2 rounded-xl bg-surface-raised/40 p-4 border border-border/80">
                <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                  <ShieldCheck className="h-4 w-4 text-purple-400" />
                  <span>{field.label}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  {/* Current State */}
                  <div className="p-3 rounded-lg bg-surface-base border border-border/60 space-y-1">
                    <span className="font-bold text-text-muted uppercase text-[10px] tracking-wider block">
                      CURRENT VALUE
                    </span>
                    <div
                      className={`text-text-secondary leading-relaxed ${
                        field.isBangla ? "font-bangla" : ""
                      }`}
                    >
                      {currentStr && currentStr.trim().length > 0 ? (
                        currentStr
                      ) : (
                        <span className="text-text-muted italic">None specified (Empty)</span>
                      )}
                    </div>
                  </div>

                  {/* AI Suggestion */}
                  <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-300 uppercase text-[10px] tracking-wider block">
                        AI SUGGESTION
                      </span>
                      <Sparkles className="h-3 w-3 text-purple-400" />
                    </div>
                    <div
                      className={`text-purple-100 font-medium leading-relaxed ${
                        field.isBangla ? "font-bangla text-emerald-300" : ""
                      }`}
                    >
                      {suggestedStr && suggestedStr.trim().length > 0 ? (
                        suggestedStr
                      ) : (
                        <span className="text-text-muted italic">No suggestion generated</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-[11px] text-text-muted">
            Clicking <strong className="text-emerald-400">Apply</strong> populates the editor fields. Content is only persisted when you click Save.
          </p>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel} className="h-9 text-xs">
              Cancel
            </Button>
            <Button
              onClick={onApply}
              variant="cinematic"
              className="h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Apply Suggestions</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
