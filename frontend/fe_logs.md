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