from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .routers import public_router, admin_router, auth_router
from .routers import upload_router

settings = get_settings()

# АВТОМАТИЧЕСКОЕ создание папок (с parents=True для вложенных путей)
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.UPLOAD_DIR + "/images").mkdir(parents=True, exist_ok=True)
Path(settings.UPLOAD_DIR + "/documents").mkdir(parents=True, exist_ok=True)
Path("app/static").mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="TaracliaGaz API",
    description="Backend API for taraclia-gaz.md",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Статика
app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Роутеры
app.include_router(auth_router.router)
app.include_router(public_router.router)
app.include_router(admin_router.router)
app.include_router(upload_router.router)

@app.get("/")
async def root():
    return {"status": "TaracliaGaz API is online"}

@app.get("/health")
async def health():
    return {"status": "ok"}