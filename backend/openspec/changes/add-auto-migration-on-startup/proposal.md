# Change: Add Auto Migration on Startup

## Why

When users delete the database file (e.g., `~/.config/exogen/exogen_backend/exogen_backend.db`) and restart the application, the current implementation creates tables via `Base.metadata.create_all()` but does not create the `alembic_version` table. Later attempts to run `alembic upgrade head` fail with "table already exists" errors because Alembic thinks no migrations have been applied. This creates a broken state that requires manual intervention to fix.

## What Changes

- Remove `Base.metadata.create_all()` from `DatabaseService.init()`
- Add programmatic Alembic migration execution on startup
- Handle path resolution for `alembic.ini` when running from different working directories
- Ensure both fresh databases and existing databases with pending migrations are handled correctly

## Impact

- Affected specs: New `database-initialization` capability
- Affected code:
  - `app/database/service.py` - Replace `create_all()` with Alembic upgrade
  - `alembic.ini` - May need path adjustments for production use
