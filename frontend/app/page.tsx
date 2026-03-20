"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator } from "lucide-react";

import { CalculationForm } from "./components/CalculationForm";
import { ChatPanel } from "./components/ChatPanel";
import { ExplanationPanel } from "./components/ExplanationPanel";
import { GraphPanel } from "./components/GraphPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { ResultCard } from "./components/ResultCard";
import type { ChatMessage, HistoryEntry, Mode, PlotTrace, TutorMode } from "./components/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

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
  const [sessionId, setSessionId] = useState("");
  const [chatMode, setChatMode] = useState<TutorMode>("socratic");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

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

  useEffect(() => {
    const sessionKey = "calc-ai-chat-session-id";
    const chatKey = "calc-ai-chat-history";

    let id = sessionStorage.getItem(sessionKey);
    if (!id) {
      id = `session-${Date.now()}`;
      sessionStorage.setItem(sessionKey, id);
    }
    setSessionId(id);

    const chatRaw = sessionStorage.getItem(chatKey);
    if (!chatRaw) return;
    try {
      setChatMessages(JSON.parse(chatRaw));
    } catch {
      setChatMessages([]);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("calc-ai-chat-history", JSON.stringify(chatMessages.slice(-20)));
  }, [chatMessages]);

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

  const onSendChat = async () => {
    if (!chatInput.trim() || !sessionId) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setIsChatLoading(true);
    setChatMessages((previous) => [...previous, { role: "user", content: userMessage }]);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
          tutor_mode: chatMode,
          mode,
          expression,
          result,
          explanation,
        }),
      });

      if (!response.ok) {
        const failure = await response.json();
        throw new Error(failure.detail ?? "Chat request failed.");
      }

      const data = await response.json();
      setChatMessages((previous) => [...previous, { role: "assistant", content: data.reply ?? "" }]);
    } catch (requestError) {
      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: requestError instanceof Error ? requestError.message : "Unexpected chat error.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
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
            Phase 3
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row gap-6 p-4 md:p-8">
        <div className="flex w-full lg:w-[400px] shrink-0 flex-col gap-6">
          <CalculationForm
            mode={mode}
            setMode={setMode}
            expression={expression}
            setExpression={setExpression}
            variable={variable}
            setVariable={setVariable}
            limitPoint={limitPoint}
            setLimitPoint={setLimitPoint}
            limitDirection={limitDirection}
            setLimitDirection={setLimitDirection}
            derivativeType={derivativeType}
            setDerivativeType={setDerivativeType}
            derivativeOrder={derivativeOrder}
            setDerivativeOrder={setDerivativeOrder}
            parametricX={parametricX}
            setParametricX={setParametricX}
            parametricY={parametricY}
            setParametricY={setParametricY}
            integralType={integralType}
            setIntegralType={setIntegralType}
            lowerBound={lowerBound}
            setLowerBound={setLowerBound}
            upperBound={upperBound}
            setUpperBound={setUpperBound}
            seriesType={seriesType}
            setSeriesType={setSeriesType}
            seriesPreset={seriesPreset}
            setSeriesPreset={setSeriesPreset}
            seriesOrder={seriesOrder}
            setSeriesOrder={setSeriesOrder}
            seriesCenter={seriesCenter}
            setSeriesCenter={setSeriesCenter}
            isLoading={isLoading}
            onSolve={onSolve}
          />

          <HistoryPanel history={history} onSelectHistory={onSelectHistory} />
        </div>

        <div className="flex flex-1 flex-col gap-6 min-w-0">
          <ResultCard result={result} error={error} formatResult={toLatexSafe} />
          <GraphPanel plotTraces={plotTraces} plotMessage={plotMessage} />
          <ExplanationPanel explanation={explanation} isLoading={isLoading} />
          <ChatPanel
            chatMode={chatMode}
            setChatMode={setChatMode}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            isChatLoading={isChatLoading}
            onSendChat={onSendChat}
          />

        </div>
      </main>
    </div>
  );
}
