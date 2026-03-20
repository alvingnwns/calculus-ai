export type Mode = "limits" | "derivatives" | "integral" | "series";

export type HistoryEntry = {
  mode: Mode;
  expressionLabel: string;
  result: string;
  explanation?: string | null;
};

export type PlotTrace = {
  name: string;
  x: number[];
  y: number[];
  mode?: "lines";
  fill?: "none" | "tozeroy";
};

export type TutorMode = "hint" | "socratic" | "full";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
