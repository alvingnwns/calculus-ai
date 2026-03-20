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
