import { Library } from "lucide-react";

import type { HistoryEntry } from "./types";

type HistoryPanelProps = {
  history: HistoryEntry[];
  onSelectHistory: (item: HistoryEntry) => void;
};

export function HistoryPanel({ history, onSelectHistory }: HistoryPanelProps) {
  return (
    <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mb-4 flex items-center gap-2">
        <Library className="h-4 w-4 text-zinc-500" />
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Recent Computations</h2>
      </div>
      <p className="mb-3 text-xs text-zinc-500">Click an item to load its result and explanation.</p>
      <ul className="scrollbar-thin flex-1 space-y-3 overflow-y-auto pr-2">
        {history.map((item, index) => (
          <li
            key={`${item.expressionLabel}-${index}`}
            className="group rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-sm transition-colors hover:border-indigo-200 dark:border-zinc-800/80 dark:bg-zinc-900/30 dark:hover:border-indigo-900/50"
          >
            <button type="button" onClick={() => onSelectHistory(item)} className="w-full text-left">
              <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-500">
                <span className="capitalize">{item.mode}</span>
              </div>
              <p className="mb-1 truncate font-mono text-zinc-800 dark:text-zinc-200">{item.expressionLabel}</p>
              <p className="truncate text-xs text-zinc-500">Result: {item.result || "-"}</p>
            </button>
          </li>
        ))}
        {!history.length && (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-zinc-400">
            <Library className="h-8 w-8 opacity-20" />
            <p className="text-xs">No history yet.</p>
          </div>
        )}
      </ul>
    </section>
  );
}
