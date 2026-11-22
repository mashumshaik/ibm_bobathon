from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.routers import auth, issues, votes, wards, leaderboard
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="Prajaakeeya+ API", version="1.0.0", lifespan=lifespan)

cors_origins = os.getenv("CORS_ORIGIN", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(issues.router, prefix="/api/issues", tags=["issues"])
app.include_router(votes.router, prefix="/api/issues", tags=["votes"])
app.include_router(wards.router, prefix="/api/wards", tags=["wards"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["leaderboard"])

@app.get("/api/health")
def health():
    return {"status": "ok"}
