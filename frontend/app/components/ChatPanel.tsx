import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

import type { ChatMessage, TutorMode } from "./types";

type ChatPanelProps = {
  chatMode: TutorMode;
  setChatMode: (mode: TutorMode) => void;
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (value: string) => void;
  isChatLoading: boolean;
  onSendChat: () => void;
};

export function ChatPanel({
  chatMode,
  setChatMode,
  chatMessages,
  chatInput,
  setChatInput,
  isChatLoading,
  onSendChat,
}: ChatPanelProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Tutor Chat (Phase 3)</h2>
        <select
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900"
          value={chatMode}
          onChange={(event) => setChatMode(event.target.value as TutorMode)}
        >
          <option value="hint">Hint Only</option>
          <option value="socratic">Socratic</option>
          <option value="full">Full Solution</option>
        </select>
      </div>

      <div className="mb-4 max-h-64 space-y-3 overflow-y-auto rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        {!chatMessages.length ? (
          <p className="text-sm text-zinc-500">Ask a follow-up like why this step? or show another method.</p>
        ) : (
          chatMessages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-lg px-3 py-2 text-sm ${
                message.role === "user"
                  ? "ml-auto max-w-[85%] bg-indigo-600 text-white"
                  : "max-w-[85%] bg-zinc-200/70 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              <p className="mb-1 text-[11px] font-semibold uppercase opacity-70">{message.role}</p>
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-6 prose-p:my-2 dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-6">{message.content}</p>
              )}
            </div>
          ))
        )}
        {isChatLoading ? <p className="text-xs text-zinc-500">Tutor is thinking...</p> : null}
      </div>

      <div className="flex gap-2">
        <input
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          placeholder="Ask the tutor a follow-up question..."
          value={chatInput}
          onChange={(event) => setChatInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSendChat();
            }
          }}
        />
        <button
          type="button"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          onClick={onSendChat}
          disabled={isChatLoading || !chatInput.trim()}
        >
          Send
        </button>
      </div>
    </section>
  );
}
