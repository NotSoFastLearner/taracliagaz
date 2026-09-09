# TaracliaGaz

Веб-сайт SRL «Taraclia Gaz» — компании по поставке природного газа в Тараклийском районе Молдовы.

**Домен:** https://taraclia-gaz.md

## Структура проекта

    taracliagaz/
    ├── src/
    │   ├── TaracliaGaz.Api/       # Backend: FastAPI + SQLite
    │   └── TaracliaGaz.Web/       # Frontend: React + Vite + TypeScript
    ├── README.md
    ├── DEPLOY.md
    └── .gitignore

## Стек технологий

### Backend

- **Python 3.11+**
- **FastAPI** — веб-фреймворк
- **SQLAlchemy** — ORM для работы с БД
- **SQLite** — база данных (можно заменить на PostgreSQL)
- **Pydantic** — валидация данных
- **python-jose** — JWT токены
- **SlowAPI** — rate limiting

### Frontend

- **React 19** — UI библиотека
- **TypeScript** — типизация
- **Vite** — сборщик
- **React Router** — маршрутизация
- **Tiptap** — WYSIWYG редактор
- **Zod** — валидация форм
- **react-helmet-async** — meta-теги

## Локальная разработка

### Backend

```bash
cd src/TaracliaGaz.Api

# Скопировать переменные окружения
copy .env.example .env

# Установить зависимости
pip install -r requirements.txt

# Применить миграции и заполнить БД
python seed.py
python seed_legal_pages.py
python seed_menu.py

# Запустить dev-сервер
uvicorn app.main:app --reload --no-server-header --no-date-header

Backend будет доступен на http://127.0.0.1:8000
Swagger UI: http://127.0.0.1:8000/docs
Frontend