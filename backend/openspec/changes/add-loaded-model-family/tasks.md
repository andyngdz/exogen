## 1. Implementation
- [x] 1.1 Add `ModelFamily` enum/schema used by API responses
- [x] 1.2 Implement authoritative family detection from the loaded diffusers pipeline (config/class)
- [x] 1.3 Update `GET /models/status` to always return `loaded_model_family`
- [x] 1.4 Update `POST /models/load` response to include `family`

## 2. Tests
- [x] 2.1 Add/extend tests for `GET /models/status` (no model => `unknown`, loaded => expected family)
- [x] 2.2 Add/extend tests for `POST /models/load` response includes `family`

## 3. Quality
- [x] 3.1 Run format/lint/typecheck: `uv run ruff format && uv run ruff check --fix && uv run ty check`
- [x] 3.2 Run unit tests: `uv run pytest tests/app/features/models/test_api.py`
