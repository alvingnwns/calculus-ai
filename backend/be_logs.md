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

## 2026-03-20 - Environment Setup
- Created backend `.env` file with `GEMINI_API_KEY` and `GEMINI_MODEL` placeholders for local secret configuration.
- Fixed root `.gitignore` entry to ignore `backend/.env` and prevent accidental secret commits.

## 2026-03-20 - Runtime Env Loading and Validation
- Updated backend startup to load environment variables from `.env` using `python-dotenv`.
- Verified `GET /health` response is healthy while running locally.
- Verified `POST /api/calculate` returns symbolic result and Gemini-generated explanation with configured API key.
- Ran frontend lint successfully after integration changes.

## 2026-03-20 - Phase 2 Graph API Start
- Added plot request/response schemas and trace models for graph payloads.
- Added `POST /api/plot` endpoint for frontend graph rendering.
- Implemented graph data service for explicit derivative curves and integral curve/area shading.
- Registered plot route in FastAPI startup.

## 2026-03-20 - Complex Expression Parsing Fix
- Added shared expression parser service to support implicit multiplication and caret exponent input (e.g., `3x`, `sin(x)^2`).
- Updated `math_engine` to use the shared parser across limits, derivatives, integrals, and series expression handling.
- Updated `plot_engine` to use the same parser so `/api/plot` behavior matches `/api/calculate`.
- Validated derivative and plot generation for input `sin(x)^2 - 3x`.

## 2026-03-20 - Plot Notation Label Cleanup
- Updated derivative plot trace labels to avoid caret notation (e.g., `d²f/dx²` instead of `d^2f/dx^2`).
- Kept first derivative label concise as `df/dx` for readability.