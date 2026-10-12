# Architecture

**Stack:** FastAPI + SQLAlchemy 2.0 + Socket.IO | SQLite | Pytest + pytest-asyncio

**Structure:**

- `app/features/` - Feature modules (generators, downloads, models, histories)
- `app/cores/` - Core services (model_manager, model_loader, samplers, constants)
- `app/services/` - Utilities (device, image, storage, logger, memory)
- `app/database/` - SQLAlchemy models and CRUD operations
- `app/schemas/` - Shared Pydantic schemas (avoid circular imports)

**Key conventions:**

- Tab indentation, single quotes (ruff.toml)
- Async/await throughout
- Pydantic schemas for all API responses (never raw dicts)
- Type hints required (ty enforced)

**Pre-commit:** Husky runs `ruff format`, `ruff check`, and `ty check` on staged files. Commits blocked if checks fail.

## Avoiding Circular Imports

**Use shared schemas in `app/schemas/`** instead of importing between features.

**Bad (circular):**

```python
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.features.generators.schemas import LoRAData
```

**Good (shared schemas):**

```python
# app/schemas/lora.py
from pydantic import BaseModel, Field

class LoRAData(BaseModel):
    id: int = Field(..., description='Database ID')
    name: str = Field(..., description='Display name')
    weight: float = Field(..., ge=0.0, le=2.0)

# Import from shared location
from app.schemas.lora import LoRAData
```

**Benefits:** No TYPE_CHECKING workarounds, clear dependencies, better IDE support

## Code Duplication and Modularity

**Maintain ≤3% duplication (SonarQube quality gate):**

- Extract when logic appears in 2+ places (especially 10+ lines)
- Create shared utilities in `app/cores/` or `app/services/`
- Place generation utilities in `app/cores/generation/`
- Place infrastructure utilities in `app/services/`
- Add tests for shared utilities (aim for 80%+ coverage)

**Modularity:**

- Split files >150 lines into focused modules
- Keep service files as thin orchestration layers
- Group functions by responsibility
- Use descriptive filenames
