# Development Commands

**Database migrations (run automatically on startup):**

```bash
uv run alembic revision --autogenerate -m "message"   # Create new migration
uv run alembic downgrade -1                           # Rollback last migration
```

**Running the application:**

```bash
uv run python main.py  # or: uv run uvicorn main:app --reload
```

**Testing:**

```bash
uv run pytest                    # Run all tests
uv run pytest -q                 # Quiet mode
uv run pytest tests/path/to/file.py  # Specific file
uv run pytest -q --cov=app       # With coverage
```

**Code quality:**

```bash
uv run ruff format               # Format (tabs, single quotes)
uv run ruff check                # Lint
uv run ruff check --fix          # Lint and fix
uv run ty check app tests           # Type checking
uv run ty check path/to/file.py     # Type check specific file (faster)
```
