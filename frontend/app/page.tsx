"use client";

import { Calculator } from "lucide-react";

import { CalculationForm } from "./components/CalculationForm";
import { ChatPanel } from "./components/ChatPanel";
import { ExplanationPanel } from "./components/ExplanationPanel";
import { GraphPanel } from "./components/GraphPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { ResultCard } from "./components/ResultCard";
import { useCalculation } from "./hooks/useCalculation";
import { useTutorChat } from "./hooks/useTutorChat";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export default function Home() {
  const calculation = useCalculation(API_BASE_URL);
  const chat = useTutorChat(API_BASE_URL, calculation.chatContext);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-10 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 md:px-8 gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Calculator className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Calculus AI</h1>
          <div className="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            Phase 3
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row gap-6 p-4 md:p-8">
        <div className="flex w-full lg:w-[400px] shrink-0 flex-col gap-6">
          <CalculationForm {...calculation.formProps} />
          <HistoryPanel history={calculation.history} onSelectHistory={calculation.onSelectHistory} />
        </div>

        <div className="flex flex-1 flex-col gap-6 min-w-0">
          <ResultCard result={calculation.result} error={calculation.error} formatResult={calculation.formatResult} />
          <GraphPanel plotTraces={calculation.plotTraces} plotMessage={calculation.plotMessage} />
          <ExplanationPanel explanation={calculation.explanation} isLoading={calculation.isLoading} />
          <ChatPanel {...chat.panelProps} />

        </div>
      </main>
    </div>
  );
}
