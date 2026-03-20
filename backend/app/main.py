from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.routes.calculate import router as calculate_router
from app.api.routes.history import router as history_router

load_dotenv()

app = FastAPI(
    title="Calculus AI Tutor API",
    description="Backend for solving and explaining complex calculus problems.",
    version="1.0.0"
)

# Allow the frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "The Calculus AI engine is online."}


app.include_router(calculate_router, prefix="/api")
app.include_router(history_router, prefix="/api")