import dynamic from "next/dynamic";
import { LineChart } from "lucide-react";

import type { PlotTrace } from "./types";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type GraphPanelProps = {
  plotTraces: PlotTrace[];
  plotMessage: string;
};

export function GraphPanel({ plotTraces, plotMessage }: GraphPanelProps) {
  if (!plotTraces.length && !plotMessage) return null;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mb-4 flex items-center gap-2">
        <LineChart className="h-4 w-4 text-indigo-500" />
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Visualization</h2>
      </div>
      {plotMessage ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
          {plotMessage}
        </p>
      ) : null}
      {plotTraces.length > 0 && (
        <div className="w-full overflow-hidden rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-black">
          <Plot
            data={plotTraces.map((trace, index) => ({
              x: trace.x,
              y: trace.y,
              type: "scatter",
              mode: "lines",
              name: trace.name,
              fill: trace.fill === "tozeroy" ? "tozeroy" : undefined,
              line: {
                width: index === 0 ? 3 : 2,
                color: index === 0 ? "#6366f1" : "#a855f7",
              },
              fillcolor: "rgba(99, 102, 241, 0.1)",
            }))}
            layout={{
              autosize: true,
              height: 380,
              paper_bgcolor: "transparent",
              plot_bgcolor: "transparent",
              margin: { t: 20, l: 40, r: 20, b: 40 },
              font: { color: "#71717a" },
              xaxis: { gridcolor: "rgba(113, 113, 122, 0.2)", zerolinecolor: "rgba(113, 113, 122, 0.5)" },
              yaxis: { gridcolor: "rgba(113, 113, 122, 0.2)", zerolinecolor: "rgba(113, 113, 122, 0.5)" },
            }}
            style={{ width: "100%" }}
            useResizeHandler
            config={{ responsive: true, displaylogo: false }}
          />
        </div>
      )}
    </section>
  );
}
