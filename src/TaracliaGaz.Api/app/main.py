from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .routers import public_router, admin_router, auth_router, frontend_router

settings = get_settings()

app = FastAPI(
    title="TaracliaGaz API",
    description="Backend API for taraclia-gaz.md",
    version="0.1.0",
)

# CORS (для React-админки)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Статические файлы (CSS, JS, картинки)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Роутеры
app.include_router(auth_router.router)
app.include_router(public_router.router)
app.include_router(admin_router.router)
app.include_router(frontend_router.router)


@app.get("/")
async def root():
    return {"status": "TaracliaGaz API is online"}


@app.get("/health")
async def health():
    return {"status": "ok"}