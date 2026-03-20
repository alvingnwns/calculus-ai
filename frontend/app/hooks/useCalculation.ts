import { useEffect, useMemo, useState } from "react";

import type { HistoryEntry, Mode, PlotTrace } from "../components/types";

function toLatexSafe(value: string) {
  let latex = value
    .replaceAll("**", "^")
    .replaceAll("oo", "\\infty")
    .replace(/\s*\*\s*/g, "*");

  latex = latex
    .replace(/(\d)\*([a-zA-Z(])/g, "$1$2")
    .replace(/([a-zA-Z)\]])\*([a-zA-Z(])/g, "$1$2")
    .replace(/\^(\-?\d+|[a-zA-Z]+)/g, "^{$1}")
    .replace(/\*/g, " \\cdot ");

  return latex;
}

export function useCalculation(apiBaseUrl: string) {
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

  const [result, setResult] = useState("");
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");
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
      const response = await fetch(`${apiBaseUrl}/calculate`, {
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
        const plotResponse = await fetch(`${apiBaseUrl}/plot`, {
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

  return {
    result,
    error,
    explanation,
    isLoading,
    history,
    plotTraces,
    plotMessage,
    onSelectHistory,
    formatResult: toLatexSafe,
    chatContext: { mode, expression, result, explanation },
    formProps: {
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
    },
  };
}
