import { useEffect, useState } from "react";

import type { ChatMessage, Mode, TutorMode } from "../components/types";

type ChatContext = {
  mode: Mode;
  expression: string;
  result: string;
  explanation: string;
};

function normalizeAssistantReply(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function useTutorChat(apiBaseUrl: string, context: ChatContext) {
  const [sessionId, setSessionId] = useState("");
  const [chatMode, setChatMode] = useState<TutorMode>("socratic");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

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

  const onSendChat = async () => {
    if (!chatInput.trim() || !sessionId) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setIsChatLoading(true);
    setChatMessages((previous) => [...previous, { role: "user", content: userMessage }]);

    try {
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
          tutor_mode: chatMode,
          mode: context.mode,
          expression: context.expression,
          result: context.result,
          explanation: context.explanation,
        }),
      });

      if (!response.ok) {
        const failure = await response.json();
        throw new Error(failure.detail ?? "Chat request failed.");
      }

      const data = await response.json();
      const reply = normalizeAssistantReply(String(data.reply ?? ""));
      setChatMessages((previous) => [...previous, { role: "assistant", content: reply }]);
    } catch (requestError) {
      setChatMessages((previous) => [
        ...previous,
        { role: "assistant", content: requestError instanceof Error ? requestError.message : "Unexpected chat error." },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return {
    panelProps: {
      chatMode,
      setChatMode,
      chatMessages,
      chatInput,
      setChatInput,
      isChatLoading,
      onSendChat,
    },
  };
}
