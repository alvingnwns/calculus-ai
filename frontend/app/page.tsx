"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { BlockMath } from "react-katex";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Calculator, ArrowRight, Activity, Library, LineChart, Loader2, Info } from "lucide-react";

type Mode = "limits" | "derivatives" | "integral" | "series";
type HistoryEntry = {
  mode: Mode;
  expressionLabel: string;
  result: string;
  explanation?: string | null;
};

type PlotTrace = {
  name: string;
  x: number[];
  y: number[];
  mode?: "lines";
  fill?: "none" | "tozeroy";
};

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const SYMBOLS = ["sin(", "cos(", "tan(", "log(", "e^(", "^", "sqrt(", "pi", "oo", "I"];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

function toLatexSafe(value: string) {
  return value
    .replaceAll("**", "^")
    .replaceAll("*", " \\\\cdot ")
    .replaceAll("oo", "\\infty");
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("limits");
  const [expression, setExpression] = useState("");
  const [variable, setVariable] = useState("x");

  const [limitPoint, setLimitPoint] = useState("0");
  const [limitDirection, setLimitDirection] = useState("+-");

  const [derivativeType, setDerivativeType] = useState("explicit");
  const [derivativeOrder, setDerivativeOrder] = useState(1);
  const [parametricX, setParametricX] = useState("t");
  const [parametricY, setParametricY] = useState("t^2");

  const [integralType, setIntegralType] = useState("definite");
  const [lowerBound, setLowerBound] = useState("0");
  const [upperBound, setUpperBound] = useState("1");

  const [seriesType, setSeriesType] = useState("maclaurin");
  const [seriesPreset, setSeriesPreset] = useState("sin");
  const [seriesOrder, setSeriesOrder] = useState(6);
  const [seriesCenter, setSeriesCenter] = useState("0");

  const [result, setResult] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [plotTraces, setPlotTraces] = useState<PlotTrace[]>([]);
  const [plotMessage, setPlotMessage] = useState("");

  useEffect(() => {
    const historyRaw = sessionStorage.getItem("calc-ai-history");
    if (!historyRaw) return;
    try {
      setHistory(JSON.parse(historyRaw));
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("calc-ai-history", JSON.stringify(history.slice(0, 10)));
  }, [history]);

  const expressionLabel = useMemo(() => {
    if (mode === "derivatives" && derivativeType === "parametric") {
      return `x(${variable})=${parametricX}, y(${variable})=${parametricY}`;
    }
    return expression || "-";
  }, [derivativeType, expression, mode, parametricX, parametricY, variable]);

  const buildPayload = () => {
    if (mode === "limits") {
      return { mode, expression, variable, point: limitPoint, limit_direction: limitDirection, explain: true };
    }
    if (mode === "derivatives") {
      return {
        mode,
        expression,
        variable,
        derivative_type: derivativeType,
        derivative_order: derivativeOrder,
        parametric_x: derivativeType === "parametric" ? parametricX : null,
        parametric_y: derivativeType === "parametric" ? parametricY : null,
        explain: true,
      };
    }
    if (mode === "integral") {
      return {
        mode,
        expression,
        variable,
        integral_type: integralType,
        lower_bound: integralType === "definite" ? lowerBound : null,
        upper_bound: integralType === "definite" ? upperBound : null,
        explain: true,
      };
    }
    return {
      mode,
      expression,
      variable,
      series_type: seriesType,
      series_preset: seriesPreset,
      series_order: seriesOrder,
      series_center: seriesType === "taylor" ? seriesCenter : null,
      explain: true,
    };
  };

  const onSolve = async () => {
    setError("");
    setIsLoading(true);
    setPlotMessage("");

    try {
      const payload = buildPayload();
      const response = await fetch(`${API_BASE_URL}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const failure = await response.json();
        throw new Error(failure.detail ?? "Request failed.");
      }

      const data = await response.json();
      setResult(data.result ?? "");
      setExplanation(data.explanation ?? "");
      setHistory((previous) => [
        {
          mode,
          expressionLabel,
          result: String(data.result ?? ""),
          explanation: data.explanation ?? null,
        },
        ...previous,
      ].slice(0, 10));

      const shouldPlot = mode === "derivatives" || mode === "integral";
      if (shouldPlot) {
        const plotResponse = await fetch(`${API_BASE_URL}/plot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, x_min: -10, x_max: 10, points: 250 }),
        });

        if (plotResponse.ok) {
          const plotData = await plotResponse.json();
          setPlotTraces(plotData.traces ?? []);
          setPlotMessage(plotData.message ?? "");
        } else {
          setPlotTraces([]);
          setPlotMessage("Graph data could not be generated for this input.");
        }
      } else {
        setPlotTraces([]);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error.");
      setPlotTraces([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSelectHistory = (item: HistoryEntry) => {
    setMode(item.mode);
    setError("");
    setResult(item.result);
    setExplanation(item.explanation ?? "");
    setPlotTraces([]);
    if (item.mode === "derivatives" || item.mode === "integral") {
      setPlotMessage("Loaded from history. Click Solve Expression to regenerate the graph.");
    } else {
      setPlotMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-10 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 md:px-8 gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Calculator className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Calculus AI</h1>
          <div className="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            Phase 2
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row gap-6 p-4 md:p-8">
        
        {/* Left Column: Input Panel */}
        <div className="flex w-full lg:w-[400px] shrink-0 flex-col gap-6">
          <section className="flex flex-col gap-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-sm">
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Operation</span>
                <select className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 pr-8 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm" value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
                  <option value="limits">Limits</option>
                  <option value="derivatives">Derivatives</option>
                  <option value="integral">Integrals</option>
                  <option value="series">Series Expansions</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Variable</span>
                <input className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm" value={variable} onChange={(event) => setVariable(event.target.value)} />
              </label>

              {!(mode === "series") && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Expression</span>
                  <input
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 text-sm font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                    placeholder="e.g. sin(x)^2 + x^3"
                    value={expression}
                    onChange={(event) => setExpression(event.target.value)}
                  />
                </label>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                {SYMBOLS.map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 px-2.5 py-1.5 text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shadow-sm"
                    onClick={() => setExpression((previous) => `${previous}${symbol}`)}
                  >
                    {symbol}
                  </button>
                ))}
              </div>

              {/* Dynamic Inputs based on mode... */}
              <div className="pt-2">
                {mode === "limits" && (
                  <div className="grid gap-3 grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Point</span>
                      <input className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" value={limitPoint} onChange={(event) => setLimitPoint(event.target.value)} />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Direction</span>
                      <select className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" value={limitDirection} onChange={(event) => setLimitDirection(event.target.value)}>
                        <option value="+-">Both</option>
                        <option value="+">Right (+)</option>
                        <option value="-">Left (-)</option>
                      </select>
                    </label>
                  </div>
                )}

                {mode === "derivatives" && (
                  <div className="grid gap-3 grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</span>
                      <select className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" value={derivativeType} onChange={(event) => setDerivativeType(event.target.value)}>
                        <option value="explicit">Explicit</option>
                        <option value="implicit">Implicit</option>
                        <option value="parametric">Parametric</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Order (1-3)</span>
                      <input type="number" min={1} max={3} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" value={derivativeOrder} onChange={(event) => setDerivativeOrder(Number(event.target.value || 1))} />
                    </label>
                    {derivativeType === "parametric" && (
                      <div className="col-span-2 grid grid-cols-2 gap-3 mt-1">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">x(t)</span>
                          <input className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-sm font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" value={parametricX} onChange={(event) => setParametricX(event.target.value)} />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">y(t)</span>
                          <input className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-sm font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" value={parametricY} onChange={(event) => setParametricY(event.target.value)} />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {mode === "integral" && (
                  <div className="grid gap-3 grid-cols-2">
                    <label className="space-y-2 col-span-2">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</span>
                      <select className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" value={integralType} onChange={(event) => setIntegralType(event.target.value)}>
                        <option value="definite">Definite</option>
                        <option value="indefinite">Indefinite</option>
                      </select>
                    </label>
                    {integralType === "definite" && (
                      <>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Lower bound</span>
                          <input className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" value={lowerBound} onChange={(event) => setLowerBound(event.target.value)} />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Upper bound</span>
                          <input className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" value={upperBound} onChange={(event) => setUpperBound(event.target.value)} />
                        </label>
                      </>
                    )}
                  </div>
                )}

                {mode === "series" && (
                  <div className="grid gap-3 grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</span>
                      <select className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" value={seriesType} onChange={(event) => setSeriesType(event.target.value)}>
                        <option value="maclaurin">Maclaurin</option>
                        <option value="taylor">Taylor</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Preset</span>
                      <select className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" value={seriesPreset} onChange={(event) => setSeriesPreset(event.target.value)}>
                        <option value="sin">sin(x)</option>
                        <option value="cos">cos(x)</option>
                        <option value="ln">ln(1+x)</option>
                        <option value="exp">e^x</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Order</span>
                      <input type="number" min={1} max={20} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" value={seriesOrder} onChange={(event) => setSeriesOrder(Number(event.target.value || 1))} />
                    </label>
                    {seriesType === "taylor" && (
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Center</span>
                        <input className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" value={seriesCenter} onChange={(event) => setSeriesCenter(event.target.value)} />
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              onClick={onSolve}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Computing...
                </>
              ) : (
                <>
                  Solve Expression
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </section>

          {/* History Sidebar */}
          <section className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Library className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Recent Computations</h2>
            </div>
            <p className="mb-3 text-xs text-zinc-500">Click an item to load its result and explanation.</p>
            <ul className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-thin">
              {history.map((item, index) => (
                <li key={`${item.expressionLabel}-${index}`} className="group rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 text-sm transition-colors hover:border-indigo-200 dark:hover:border-indigo-900/50">
                  <button type="button" onClick={() => onSelectHistory(item)} className="w-full text-left">
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                      <span className="capitalize">{item.mode}</span>
                    </div>
                    <p className="font-mono text-zinc-800 dark:text-zinc-200 mb-1 truncate">{item.expressionLabel}</p>
                    <p className="truncate text-xs text-zinc-500">Result: {item.result || "-"}</p>
                  </button>
                </li>
              ))}
              {!history.length && (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2 py-8">
                  <Library className="h-8 w-8 opacity-20" />
                  <p className="text-xs">No history yet.</p>
                </div>
              )}
            </ul>
          </section>
        </div>

        {/* Right Column: Output & Visualization */}
        <div className="flex flex-1 flex-col gap-6 min-w-0">
          
          {/* Quick Result Header */}
          <section className="relative overflow-hidden rounded-2xl bg-zinc-900 dark:bg-zinc-900 p-6 sm:p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Activity className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Computed Result</h2>
              {error ? (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 flex items-start gap-3">
                  <Info className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              ) : result ? (
                <div className="overflow-x-auto pb-4 scrollbar-thin">
                  <div className="text-2xl sm:text-3xl lg:text-4xl">
                    <BlockMath math={toLatexSafe(result)} renderError={() => <span className="font-mono">{result}</span>} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-zinc-500 text-sm italic">
                  Awaiting input...
                </div>
              )}
            </div>
          </section>

          {/* Graph Visualization (if applicable) */}
          {(plotTraces.length > 0 || plotMessage) && (
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <LineChart className="h-4 w-4 text-indigo-500" />
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Visualization</h2>
              </div>
              {plotMessage ? (
                <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-200 dark:border-amber-500/20">{plotMessage}</p>
              ) : null}
              {plotTraces.length > 0 && (
                <div className="w-full overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-black">
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
                        color: index === 0 ? '#6366f1' : '#a855f7' // Indigo and Purple
                      },
                      fillcolor: 'rgba(99, 102, 241, 0.1)'
                    }))}
                    layout={{
                      autosize: true,
                      height: 380,
                      paper_bgcolor: "transparent",
                      plot_bgcolor: "transparent",
                      margin: { t: 20, l: 40, r: 20, b: 40 },
                      font: { color: '#71717a' },
                      xaxis: { gridcolor: 'rgba(113, 113, 122, 0.2)', zerolinecolor: 'rgba(113, 113, 122, 0.5)' },
                      yaxis: { gridcolor: 'rgba(113, 113, 122, 0.2)', zerolinecolor: 'rgba(113, 113, 122, 0.5)' }
                    }}
                    style={{ width: "100%" }}
                    useResizeHandler
                    config={{ responsive: true, displaylogo: false }}
                  />
                </div>
              )}
            </section>
          )}

          {/* AI Explanation Content */}
          <section className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">Step-by-Step Breakdown</h2>
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
              </div>
            ) : explanation ? (
              <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:text-zinc-100 marker:text-indigo-500">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {explanation}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <p className="text-sm">Run a calculation to see the AI-generated explanation.</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
