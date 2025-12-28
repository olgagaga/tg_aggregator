# Setup Guide - Phase 1

This guide will help you set up the Telegram Aggregator backend for Phase 1.

## Prerequisites

- Python 3.12+
- Docker and Docker Compose
- UV package manager (or pip)

## Installation Steps

### 1. Install Dependencies

Using UV (recommended):
```bash
uv sync
```

Or using pip:
```bash
pip install -e .
```

### 2. Set Up Environment Variables

Create a `.env` file in the backend root directory with the following content:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/tg_aggregator
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20

# Telegram API Credentials
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
TELEGRAM_SESSION_NAME=session

# OpenAI API Key (for LLM tagging)
OPENAI_API_KEY=your_openai_api_key

# Application Settings
ENVIRONMENT=development
LOG_LEVEL=INFO
API_V1_PREFIX=/api/v1

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

**Note:** Replace placeholder values with your actual credentials:
- Get Telegram API credentials from https://my.telegram.org/apps
- Get OpenAI API key from https://platform.openai.com/api-keys

### 3. Start PostgreSQL Database

Start the database using Docker Compose:

```bash
docker-compose up -d postgres
```

Or if you want to use PgBouncer for connection pooling:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- PgBouncer (optional) on port 6432

If using PgBouncer, update your `DATABASE_URL` to:
```
DATABASE_URL=postgresql://user:password@localhost:6432/tg_aggregator
```

### 4. Initialize Database Migrations

```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

**Note:** In Phase 1, there are no models yet, so migrations will be empty. This will be populated in Phase 2.

### 5. Run the Application

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --reload
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Verification

1. Check health endpoint:
   ```bash
   curl http://localhost:8000/health
   ```

2. Check root endpoint:
   ```bash
   curl http://localhost:8000/
   ```

3. Visit interactive docs:
   Open http://localhost:8000/docs in your browser

## Project Structure

```
backend/
├── app/
│   ├── api/           # API route handlers
│   ├── core/          # Configuration, logging
│   ├── db/            # Database session management
│   ├── models/        # SQLModel database models (Phase 2)
│   ├── schemas/       # Pydantic API schemas (Phase 2)
│   ├── services/      # Business logic (Phase 3+)
│   └── main.py        # FastAPI application
├── migrations/        # Alembic migration files
├── docker-compose.yml # PostgreSQL setup
└── main.py           # Application entry point
```

## Next Steps

Phase 1 is complete! You can now proceed to Phase 2: Data Persistence Layer.

