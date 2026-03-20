import type { Mode } from "./types";

type CalculationFormProps = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  expression: string;
  setExpression: (value: string) => void;
  variable: string;
  setVariable: (value: string) => void;

  limitPoint: string;
  setLimitPoint: (value: string) => void;
  limitDirection: string;
  setLimitDirection: (value: string) => void;

  derivativeType: string;
  setDerivativeType: (value: string) => void;
  derivativeOrder: number;
  setDerivativeOrder: (value: number) => void;
  parametricX: string;
  setParametricX: (value: string) => void;
  parametricY: string;
  setParametricY: (value: string) => void;

  integralType: string;
  setIntegralType: (value: string) => void;
  lowerBound: string;
  setLowerBound: (value: string) => void;
  upperBound: string;
  setUpperBound: (value: string) => void;

  seriesType: string;
  setSeriesType: (value: string) => void;
  seriesPreset: string;
  setSeriesPreset: (value: string) => void;
  seriesOrder: number;
  setSeriesOrder: (value: number) => void;
  seriesCenter: string;
  setSeriesCenter: (value: string) => void;

  isLoading: boolean;
  onSolve: () => void;
};

const SYMBOLS = ["sin(", "cos(", "tan(", "log(", "e^(", "^", "sqrt(", "pi", "oo", "I"];

export function CalculationForm(props: CalculationFormProps) {
  const {
    mode,
    setMode,
    expression,
    setExpression,
    variable,
    setVariable,
    limitPoint,
    setLimitPoint,
    limitDirection,
    setLimitDirection,
    derivativeType,
    setDerivativeType,
    derivativeOrder,
    setDerivativeOrder,
    parametricX,
    setParametricX,
    parametricY,
    setParametricY,
    integralType,
    setIntegralType,
    lowerBound,
    setLowerBound,
    upperBound,
    setUpperBound,
    seriesType,
    setSeriesType,
    seriesPreset,
    setSeriesPreset,
    seriesOrder,
    setSeriesOrder,
    seriesCenter,
    setSeriesCenter,
    isLoading,
    onSolve,
  } = props;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Operation</span>
          <select
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 pr-8 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
            value={mode}
            onChange={(event) => setMode(event.target.value as Mode)}
          >
            <option value="limits">Limits</option>
            <option value="derivatives">Derivatives</option>
            <option value="integral">Integrals</option>
            <option value="series">Series Expansions</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Variable</span>
          <input
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
            value={variable}
            onChange={(event) => setVariable(event.target.value)}
          />
        </label>

        {mode !== "series" && (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Expression</span>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
              placeholder="e.g. sin(x)^2 + x^3"
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
            />
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">
              Supports inputs like <strong>3x</strong> and <strong>^</strong>; results render in standard notation.
            </span>
          </label>
        )}

        <div className="flex flex-wrap gap-1.5 pt-1">
          {SYMBOLS.map((symbol) => (
            <button
              key={symbol}
              type="button"
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-mono text-xs text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              onClick={() => setExpression(`${expression}${symbol}`)}
            >
              {symbol}
            </button>
          ))}
        </div>

        <div className="pt-2">
          {mode === "limits" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Point</span>
                <input
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                  value={limitPoint}
                  onChange={(event) => setLimitPoint(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Direction</span>
                <select
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                  value={limitDirection}
                  onChange={(event) => setLimitDirection(event.target.value)}
                >
                  <option value="+-">Both</option>
                  <option value="+">Right (+)</option>
                  <option value="-">Left (-)</option>
                </select>
              </label>
            </div>
          )}

          {mode === "derivatives" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</span>
                <select
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                  value={derivativeType}
                  onChange={(event) => setDerivativeType(event.target.value)}
                >
                  <option value="explicit">Explicit</option>
                  <option value="implicit">Implicit</option>
                  <option value="parametric">Parametric</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Order (1-3)</span>
                <input
                  type="number"
                  min={1}
                  max={3}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                  value={derivativeOrder}
                  onChange={(event) => setDerivativeOrder(Number(event.target.value || 1))}
                />
              </label>
              {derivativeType === "parametric" && (
                <div className="col-span-2 mt-1 grid grid-cols-2 gap-3">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">x(t)</span>
                    <input
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-mono text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                      value={parametricX}
                      onChange={(event) => setParametricX(event.target.value)}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">y(t)</span>
                    <input
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-mono text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                      value={parametricY}
                      onChange={(event) => setParametricY(event.target.value)}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {mode === "integral" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</span>
                <select
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                  value={integralType}
                  onChange={(event) => setIntegralType(event.target.value)}
                >
                  <option value="definite">Definite</option>
                  <option value="indefinite">Indefinite</option>
                </select>
              </label>
              {integralType === "definite" && (
                <>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Lower bound</span>
                    <input
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                      value={lowerBound}
                      onChange={(event) => setLowerBound(event.target.value)}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Upper bound</span>
                    <input
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                      value={upperBound}
                      onChange={(event) => setUpperBound(event.target.value)}
                    />
                  </label>
                </>
              )}
            </div>
          )}

          {mode === "series" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</span>
                <select
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                  value={seriesType}
                  onChange={(event) => setSeriesType(event.target.value)}
                >
                  <option value="maclaurin">Maclaurin</option>
                  <option value="taylor">Taylor</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Preset</span>
                <select
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                  value={seriesPreset}
                  onChange={(event) => setSeriesPreset(event.target.value)}
                >
                  <option value="sin">sin(x)</option>
                  <option value="cos">cos(x)</option>
                  <option value="ln">ln(1+x)</option>
                  <option value="exp">e^x</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Order</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                  value={seriesOrder}
                  onChange={(event) => setSeriesOrder(Number(event.target.value || 1))}
                />
              </label>
              {seriesType === "taylor" && (
                <label className="space-y-2">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Center</span>
                  <input
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                    value={seriesCenter}
                    onChange={(event) => setSeriesCenter(event.target.value)}
                  />
                </label>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        onClick={onSolve}
        disabled={isLoading}
      >
        {isLoading ? "Computing..." : "Solve Expression"}
      </button>
    </section>
  );
}
