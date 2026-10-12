# Design: Auto Migration on Startup

## Context

The application currently has two conflicting database initialization mechanisms:

1. **`Base.metadata.create_all()`** - Creates tables directly from SQLAlchemy models on every startup
2. **Alembic migrations** - Expected to be run manually before starting the app

This dual approach causes issues when:
- User deletes database and restarts app (tables created without `alembic_version`)
- Running `alembic upgrade head` fails because tables already exist
- Schema evolution requires manual coordination between two systems

## Goals / Non-Goals

**Goals:**
- Single source of truth for schema management (Alembic migrations only)
- Automatic migration execution on startup without manual steps
- Handle fresh databases, existing databases, and databases with pending migrations
- Work correctly regardless of working directory (packaged Electron app scenario)

**Non-Goals:**
- Auto-generating new migrations (developers still create migrations manually)
- Rollback/downgrade support at runtime
- Multi-database support

## Decisions

### Decision 1: Remove `create_all()` entirely

Replace `Base.metadata.create_all()` with programmatic Alembic upgrade. This ensures:
- All schema changes go through migrations
- `alembic_version` table is always created and maintained
- No drift between model definitions and actual schema

**Alternatives considered:**
- Hybrid approach (keep `create_all()` + stamp) - Rejected because schema could drift
- Manual migration requirement - Rejected because it adds friction for users

### Decision 2: Programmatic Alembic execution

Use Alembic's Python API instead of CLI:

```python
from alembic.config import Config
from alembic import command

alembic_cfg = Config(alembic_ini_path)
command.upgrade(alembic_cfg, "head")
```

**Rationale:**
- No subprocess overhead
- Better error handling and logging integration
- Works in packaged applications

### Decision 3: Path resolution strategy

Resolve `alembic.ini` path relative to the module location, not the current working directory:

```python
import os
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(script_dir))  # app/database -> app -> project
alembic_ini_path = os.path.join(project_root, 'alembic.ini')
```

**Rationale:**
- Electron app may run from different working directories
- Module-relative paths are predictable and testable

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Startup time increases (migration check) | Alembic `upgrade head` is fast when no migrations needed (~10ms) |
| Migration errors crash the app | Wrap in try/except with clear error messages; let app fail fast rather than run with broken schema |
| `alembic.ini` not found in packaged app | Use module-relative path resolution; add validation on startup |

## Migration Plan

1. Update `app/database/service.py` to use Alembic instead of `create_all()`
2. Add path resolution logic for `alembic.ini`
3. Test with:
   - Fresh database (no file exists)
   - Existing database at current migration head
   - Existing database with pending migrations
   - Database created by `create_all()` without `alembic_version` (edge case - may need manual fix)
4. Update documentation to remove manual migration step

**Rollback:** Revert to previous `create_all()` implementation if critical issues found.

## Open Questions

None - approach is straightforward and well-established in the industry.
