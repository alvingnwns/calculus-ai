import { Activity, Info } from "lucide-react";
import { BlockMath } from "react-katex";

type ResultCardProps = {
  result: string;
  error: string;
  formatResult: (value: string) => string;
};

export function ResultCard({ result, error, formatResult }: ResultCardProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-zinc-900 p-6 text-white shadow-xl sm:p-8 dark:bg-zinc-900">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Activity className="h-32 w-32" />
      </div>
      <div className="relative z-10">
        <h2 className="mb-4 text-sm font-medium tracking-wider text-zinc-400 uppercase">Computed Result</h2>
        {error ? (
          <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            <Info className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        ) : result ? (
          <div className="overflow-x-auto pb-4 scrollbar-thin">
            <div className="text-2xl sm:text-3xl lg:text-4xl">
              <BlockMath math={formatResult(result)} renderError={() => <span className="font-mono">{result}</span>} />
            </div>
          </div>
        ) : (
          <div className="flex items-center text-sm text-zinc-500 italic">Awaiting input...</div>
        )}
      </div>
    </section>
  );
}
