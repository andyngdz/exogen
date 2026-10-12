# Tasks

## Implementation Order

- [x] **Add UpscalerSection schema** (`app/schemas/config.py`)
   - Create `UpscalerSection` model with `method`, `title`, `options` fields
   - Update `ConfigResponse.upscalers` type from `list[UpscalerItem]` to `list[UpscalerSection]`
   - Verify: `ty check app/schemas/config.py`

- [x] **Add get_upscaler_sections method** (`app/features/config/service.py`)
   - Add method to group upscalers by method and return sections with `options` field
   - Verify: `ty check app/features/config/service.py`

- [x] **Update config API endpoint** (`app/features/config/api.py`)
   - Change from `get_upscalers()` to `get_upscaler_sections()`
   - Verify: `ty check app/features/config/api.py`

- [x] **Update tests** (`tests/app/features/config_feature/`)
   - Update existing tests to expect new nested structure with `options`
   - Added new `TestGetUpscalerSections` test class
   - Verify: `uv run pytest tests/app/features/config_feature/ -v`

- [x] **Run full validation**
   - `uv run ruff format && uv run ruff check --fix && uv run ty check`
   - `uv run pytest` - 927 tests passed
