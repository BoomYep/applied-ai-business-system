"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AnalysisResult as AnalysisData } from "@/types";

interface AnalysisResultProps {
  customerName: string;
  email: string;
  originalMessage: string;
  analysis: AnalysisData;
  saveWarning?: string;
  onAnalyzeAnother: () => void;
}

export function AnalysisResult({
  customerName,
  email,
  originalMessage,
  analysis,
  saveWarning,
  onAnalyzeAnother,
}: AnalysisResultProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Analysis Complete
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Customer request has been analyzed and classified
          </p>
        </div>

        {saveWarning && (
          <div className="p-3 bg-priority-high/10 border border-priority-high/30 rounded-[var(--radius-md)] text-sm text-priority-high">
            {saveWarning}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-text-secondary">
              Customer:
            </span>
            <span className="text-sm text-text-primary">{customerName}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-text-secondary">
              Email:
            </span>
            <span className="text-sm text-text-primary">{email}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Original Request
        </h3>
        <div className="p-4 bg-surface border-l-4 border-surface-border rounded-[var(--radius-md)]">
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
            {originalMessage}
          </p>
        </div>
      </div>

      <div className="border-t border-surface-border pt-8 space-y-6">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          AI Classification
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Intent
            </label>
            <div className="text-base text-text-primary">{analysis.intent}</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Department
            </label>
            <div className="text-base text-text-primary">
              {analysis.department}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Priority
            </label>
            <div>
              <Badge variant={analysis.priority} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Status
            </label>
            <div>
              <Badge variant="New" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">
            Suggested Action
          </label>
          <p className="text-sm text-text-primary leading-relaxed">
            {analysis.suggestedAction}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">
            Summary
          </label>
          <p className="text-sm text-text-primary leading-relaxed">
            {analysis.summary}
          </p>
        </div>
      </div>

      <div className="pt-4">
        <Button variant="primary" onClick={onAnalyzeAnother}>
          Analyze Another Request
        </Button>
      </div>
    </div>
  );
}
