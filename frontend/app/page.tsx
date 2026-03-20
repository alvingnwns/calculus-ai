"use client";

import { useEffect, useMemo, useState } from "react";

type Mode = "limits" | "derivatives" | "integral" | "series";
type HistoryEntry = {
  mode: Mode;
  expressionLabel: string;
  result: string;
  explanation?: string | null;
};

const SYMBOLS = ["sin(", "cos(", "tan(", "log(", "e^(", "^", "sqrt(", "pi", "oo", "I"];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

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
      return {
        mode,
        expression,
        variable,
        point: limitPoint,
        limit_direction: limitDirection,
        explain: true,
      };
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

    try {
      const response = await fetch(`${API_BASE_URL}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
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
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <h1 className="text-2xl font-semibold">Calculus AI (Phase 1)</h1>

      <section className="grid gap-6 rounded-lg border border-zinc-300 p-4 dark:border-zinc-700 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-1">
              <span className="text-sm">Mode</span>
              <select className="w-full rounded border border-zinc-300 bg-transparent p-2" value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
                <option value="limits">Limits</option>
                <option value="derivatives">Derivatives</option>
                <option value="integral">Integral</option>
                <option value="series">Series</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm">Variable</span>
              <input className="w-full rounded border border-zinc-300 bg-transparent p-2" value={variable} onChange={(event) => setVariable(event.target.value)} />
            </label>
          </div>

          {!(mode === "series") && (
            <label className="space-y-1 block">
              <span className="text-sm">Expression</span>
              <input
                className="w-full rounded border border-zinc-300 bg-transparent p-2"
                placeholder="e.g. sin(x)^2 + x^3"
                value={expression}
                onChange={(event) => setExpression(event.target.value)}
              />
            </label>
          )}

          <div className="flex flex-wrap gap-2">
            {SYMBOLS.map((symbol) => (
              <button
                key={symbol}
                type="button"
                className="rounded border border-zinc-300 px-2 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                onClick={() => setExpression((previous) => `${previous}${symbol}`)}
              >
                {symbol}
              </button>
            ))}
          </div>

          {mode === "limits" && (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm">Point</span>
                <input className="w-full rounded border border-zinc-300 bg-transparent p-2" value={limitPoint} onChange={(event) => setLimitPoint(event.target.value)} />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Direction</span>
                <select className="w-full rounded border border-zinc-300 bg-transparent p-2" value={limitDirection} onChange={(event) => setLimitDirection(event.target.value)}>
                  <option value="+-">Both</option>
                  <option value="+">Right (+)</option>
                  <option value="-">Left (-)</option>
                </select>
              </label>
            </div>
          )}

          {mode === "derivatives" && (
            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-1">
                <span className="text-sm">Type</span>
                <select className="w-full rounded border border-zinc-300 bg-transparent p-2" value={derivativeType} onChange={(event) => setDerivativeType(event.target.value)}>
                  <option value="explicit">Explicit</option>
                  <option value="implicit">Implicit</option>
                  <option value="parametric">Parametric</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-sm">Order (1-3)</span>
                <input
                  type="number"
                  min={1}
                  max={3}
                  className="w-full rounded border border-zinc-300 bg-transparent p-2"
                  value={derivativeOrder}
                  onChange={(event) => setDerivativeOrder(Number(event.target.value || 1))}
                />
              </label>
              {derivativeType === "parametric" && (
                <>
                  <label className="space-y-1">
                    <span className="text-sm">x(t)</span>
                    <input className="w-full rounded border border-zinc-300 bg-transparent p-2" value={parametricX} onChange={(event) => setParametricX(event.target.value)} />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm">y(t)</span>
                    <input className="w-full rounded border border-zinc-300 bg-transparent p-2" value={parametricY} onChange={(event) => setParametricY(event.target.value)} />
                  </label>
                </>
              )}
            </div>
          )}

          {mode === "integral" && (
            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-1">
                <span className="text-sm">Type</span>
                <select className="w-full rounded border border-zinc-300 bg-transparent p-2" value={integralType} onChange={(event) => setIntegralType(event.target.value)}>
                  <option value="definite">Definite</option>
                  <option value="indefinite">Indefinite</option>
                </select>
              </label>
              {integralType === "definite" && (
                <>
                  <label className="space-y-1">
                    <span className="text-sm">Lower bound</span>
                    <input className="w-full rounded border border-zinc-300 bg-transparent p-2" value={lowerBound} onChange={(event) => setLowerBound(event.target.value)} />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm">Upper bound</span>
                    <input className="w-full rounded border border-zinc-300 bg-transparent p-2" value={upperBound} onChange={(event) => setUpperBound(event.target.value)} />
                  </label>
                </>
              )}
            </div>
          )}

          {mode === "series" && (
            <div className="grid gap-3 md:grid-cols-4">
              <label className="space-y-1">
                <span className="text-sm">Series Type</span>
                <select className="w-full rounded border border-zinc-300 bg-transparent p-2" value={seriesType} onChange={(event) => setSeriesType(event.target.value)}>
                  <option value="maclaurin">Maclaurin</option>
                  <option value="taylor">Taylor</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-sm">Preset</span>
                <select className="w-full rounded border border-zinc-300 bg-transparent p-2" value={seriesPreset} onChange={(event) => setSeriesPreset(event.target.value)}>
                  <option value="sin">sin(x)</option>
                  <option value="cos">cos(x)</option>
                  <option value="ln">ln(1+x)</option>
                  <option value="exp">e^x</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-sm">Order</span>
                <input type="number" min={1} max={20} className="w-full rounded border border-zinc-300 bg-transparent p-2" value={seriesOrder} onChange={(event) => setSeriesOrder(Number(event.target.value || 1))} />
              </label>
              {seriesType === "taylor" && (
                <label className="space-y-1">
                  <span className="text-sm">Center</span>
                  <input className="w-full rounded border border-zinc-300 bg-transparent p-2" value={seriesCenter} onChange={(event) => setSeriesCenter(event.target.value)} />
                </label>
              )}
            </div>
          )}

          <button
            type="button"
            className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-60"
            onClick={onSolve}
            disabled={isLoading}
          >
            {isLoading ? "Solving..." : "Solve"}
          </button>
        </div>

        <div className="space-y-3 rounded border border-zinc-300 p-3 dark:border-zinc-700">
          <h2 className="font-semibold">Output</h2>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <p className="text-sm"><span className="font-semibold">Result:</span> {result || "-"}</p>
          <p className="text-sm whitespace-pre-wrap"><span className="font-semibold">Explanation:</span> {explanation || "-"}</p>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-300 p-4 dark:border-zinc-700">
        <h2 className="mb-3 text-lg font-semibold">Session History (Last 10)</h2>
        <ul className="space-y-2">
          {history.map((item, index) => (
            <li key={`${item.expressionLabel}-${index}`} className="rounded border border-zinc-200 p-2 text-sm dark:border-zinc-800">
              <p><span className="font-semibold">Mode:</span> {item.mode}</p>
              <p><span className="font-semibold">Input:</span> {item.expressionLabel}</p>
              <p><span className="font-semibold">Result:</span> {item.result}</p>
            </li>
          ))}
          {!history.length && <li className="text-sm text-zinc-500">No solved problems yet.</li>}
        </ul>
      </section>
    </main>
  );
}
