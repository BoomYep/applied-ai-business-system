"use client";

import { useState } from "react";
import { IntakeForm } from "@/components/intake-form/IntakeForm";
import { AnalysisResult } from "@/components/analysis-result/AnalysisResult";
import type { AnalysisResult as AnalysisData } from "@/types";

interface ResultData {
  customerName: string;
  email: string;
  originalMessage: string;
  analysis: AnalysisData;
  saveWarning?: string;
}

export default function Home() {
  const [view, setView] = useState<"form" | "result">("form");
  const [resultData, setResultData] = useState<ResultData | null>(null);

  const handleAnalysisComplete = (data: ResultData) => {
    setResultData(data);
    setView("result");
  };

  const handleAnalyzeAnother = () => {
    setResultData(null);
    setView("form");
  };

  return (
    <div className="flex flex-col w-full space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold text-text-primary">
          Applied AI Business System
        </h1>
        <p className="text-lg text-text-secondary">
          Turn customer requests into structured business actions.
        </p>
      </header>

      <section className="max-w-2xl">
        {view === "form" && (
          <IntakeForm onAnalysisComplete={handleAnalysisComplete} />
        )}
        {view === "result" && resultData && (
          <AnalysisResult
            customerName={resultData.customerName}
            email={resultData.email}
            originalMessage={resultData.originalMessage}
            analysis={resultData.analysis}
            saveWarning={resultData.saveWarning}
            onAnalyzeAnother={handleAnalyzeAnother}
          />
        )}
      </section>

      {view === "form" && (
        <footer className="pt-8 border-t border-surface-border">
          <p className="text-sm text-text-secondary leading-relaxed">
            This demo shows how AI can transform unstructured customer requests
            into structured operational workflows.
          </p>
        </footer>
      )}
    </div>
  );
}
