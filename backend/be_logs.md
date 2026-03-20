# Project Logs

## Initial Setup
- Created `calculus-ai` root directory.
- Initialized Python virtual environment.
- Installed FastAPI, Uvicorn, SymPy, Supabase, and Google GenAI SDK.
- Established scalable `app/` directory structure for routing, schemas, and services.

## 2026-03-20 - Phase 1 Core Backend
- Implemented request/response/history schemas for calculus operations.
- Added SymPy math engine support for limits, explicit/implicit/parametric derivatives (up to 3rd), integrals (definite/indefinite), and series (Maclaurin/Taylor + presets).
- Added total-area computation for definite integrals using absolute-value integration.
- Added LLM explainer service with Gemini integration and fallback explanation when API key is missing.
- Added in-memory history store with max 10 entries.
- Added API routes: `POST /api/calculate` and `GET /api/history`.
- Wired routes into FastAPI app startup.