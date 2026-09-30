# Tasks: Add Auto Migration on Startup

## 1. Implementation

- [x] 1.1 Create `run_migrations()` function in `app/database/service.py` that uses Alembic's Python API
- [x] 1.2 Add path resolution logic to find `alembic.ini` relative to module location
- [x] 1.3 Replace `Base.metadata.create_all()` call with `run_migrations()` in `DatabaseService.init()`
- [x] 1.4 Add error handling with clear error messages for migration failures

## 2. Testing

- [x] 2.1 Add unit test for fresh database scenario (no file exists)
- [x] 2.2 Add unit test for existing database at head (no migrations needed)
- [x] 2.3 Add unit test for path resolution logic
- [x] 2.4 Verify existing test `tests/test_main.py::TestLifespan::test_lifespan_initializes_services` still passes
- [x] 2.5 Manual test: delete database file and restart app

## 3. Documentation

- [x] 3.1 Update `README.md`: Remove step 4 "Initialize database" from Installation section (lines 76-80)
- [x] 3.2 Update `README.md`: Add note that migrations run automatically on startup
- [x] 3.3 Update `docs/DEVELOPMENT_COMMANDS.md`: Change "run BEFORE starting the app" to note it's now automatic (line 3)
- [x] 3.4 Update `AGENTS.md`: Remove "Run migrations first" comment from quick commands (line 37)
