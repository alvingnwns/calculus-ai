import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

type ExplanationPanelProps = {
  explanation: string;
  isLoading: boolean;
};

export function ExplanationPanel({ explanation, isLoading }: ExplanationPanelProps) {
  return (
    <section className="flex-1 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <h2 className="mb-4 border-b border-zinc-100 pb-3 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
        Step-by-Step Breakdown
      </h2>
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800"></div>
          <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800"></div>
        </div>
      ) : explanation ? (
        <div className="prose prose-zinc max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:text-zinc-100 marker:text-indigo-500 dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {explanation}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
          <p className="text-sm">Run a calculation to see the AI-generated explanation.</p>
        </div>
      )}
    </section>
  );
}
