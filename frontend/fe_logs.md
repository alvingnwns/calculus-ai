# Project Logs

## Initial Setup
- Created `calculus-ai` root directory.
- Initialized Python virtual environment.
- Installed FastAPI, Uvicorn, SymPy, Supabase, and Google GenAI SDK.
- Established scalable `app/` directory structure for routing, schemas, and services.

## 2026-03-20 - Phase 1 Frontend MVP
- Replaced starter Next.js page with a calculus UI supporting mode selection and typed input.
- Added visual symbol keypad for quick symbol insertion.
- Added mode-specific controls for limits, derivatives (including parametric inputs and order), integrals, and series presets.
- Integrated frontend with backend `POST /api/calculate` endpoint and displayed result/explanation.
- Implemented single-user session history in `sessionStorage` capped to last 10 solved problems.
- Added `frontend/.env.local` with `NEXT_PUBLIC_API_BASE_URL` for backend connectivity.

## 2026-03-20 - Phase 2 UX and Visualization Start
- Installed KaTeX and Plotly dependencies (`react-katex`, `katex`, `react-plotly.js`, `plotly.js-dist-min`).
- Upgraded frontend layout and output panel readability.
- Added KaTeX rendering for result display with fallback to plain text.
- Added graph panel powered by backend plot data.
- Integrated frontend with `POST /api/plot` after solve for derivatives and integrals.

## 2026-03-20 - Phase 2 Design Polish
- Installed `react-markdown`, `remark-math`, `rehype-katex`, `@tailwindcss/typography`, `clsx`, `tailwind-merge`, `lucide-react`.
- Completely restructured `frontend/app/page.tsx` UI to a modern two-column layout (Left: Input Panel + History; Right: Output Canvas).
- Upgraded the AI explanation panel to render markdown and LaTeX with Tailwind `prose` styles.
- Added icon-led visual hierarchy and refined section readability.

## 2026-03-20 - Recent Computations Access Fix
- Updated history cards to be clickable so users can load prior result and explanation from session history.
- Added result preview line to each history item for faster recall.
- Added user hint text to clarify interaction behavior (`Click an item to load its result and explanation`).

## 2026-03-20 - Notation Output Formatting
- Updated result LaTeX formatter to prefer simple algebra multiplication (`2x`) instead of always forcing a dot operator.
- Fixed multiplication rendering artifact where `\cdot` text appeared due to over-escaped output.
- Improved exponent rendering to display as superscript (`x²`) via proper LaTeX exponent grouping.

## 2026-03-20 - Expression Input Helper Text
- Added inline helper text under the expression input clarifying that user input supports `3x` and `^` syntax while output renders in standard notation.

## 2026-03-20 - Phase 3 Chat Panel
- Added tutor chat panel UI with mode selector (`Hint Only`, `Socratic`, `Full Solution`).
- Added session-scoped chat persistence in `sessionStorage` for chat session ID and recent messages.
- Integrated frontend with backend `POST /api/chat` endpoint, sending current problem context (`mode`, `expression`, `result`, `explanation`).
- Added conversational message thread UI and send-on-enter behavior.
- Updated page header badge to `Phase 3`.

## 2026-03-20 - Chat Equation Rendering Fix
- Updated assistant chat bubbles to render markdown and inline/block math via `ReactMarkdown + remark-math + rehype-katex`.
- Fixed raw equation text display (e.g., `$\\sin(x)$`) by applying the same math renderer stack used in the explanation panel.

## 2026-03-20 - Page Component Refactor
- Extracted major UI sections into `frontend/app/components/` (`CalculationForm`, `HistoryPanel`, `ResultCard`, `GraphPanel`, `ExplanationPanel`, `ChatPanel`).
- Added shared component types in `frontend/app/components/types.ts`.
- Rewrote `frontend/app/page.tsx` as a cleaner orchestration layer (state, API calls, and handler wiring only).
- Verified frontend build after refactor with no regressions.
