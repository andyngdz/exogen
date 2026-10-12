# Tasks: Refactor Model Load Progress Steps

## 1. Create Centralized Steps Module

- [x] 1.1 Create `app/cores/model_loader/steps.py` with:
  - `ModelLoadStep(IntEnum)` with 8 steps (INIT through FINALIZE)
  - `STEP_CONFIG: dict[ModelLoadStep, tuple[str, ModelLoadPhase]]`
  - `TOTAL_STEPS = len(ModelLoadStep)`
  - `emit_step(model_id, step, cancel_token)` function
- [x] 1.2 Export from `app/cores/model_loader/__init__.py`

## 2. Update Model Loader Files

- [x] 2.1 Update `app/cores/model_loader/model_loader.py`:
  - Import `ModelLoadStep`, `emit_step` from steps
  - Replace `_emit_progress_step(model_id, 1, cancel_token)` with `emit_step(model_id, ModelLoadStep.INIT, cancel_token)`
  - Remove step 2 call entirely (was "Loading feature extractor")
  - Update step 3→2 (`CACHE_CHECK`), step 4→3 (`BUILD_STRATEGIES`)
  - Remove `_emit_progress_step` helper function
- [x] 2.2 Update `app/cores/model_loader/strategies.py`:
  - Import `ModelLoadStep`, `emit_step` from steps
  - Replace `emit_progress(model_id, 5, 'Loading model weights...')` with `emit_step(model_id, ModelLoadStep.LOAD_WEIGHTS, cancel_token)`
- [x] 2.3 Update `app/cores/model_loader/setup.py`:
  - Import `ModelLoadStep`, `emit_step` from steps
  - Replace steps 6-9 with enum-based calls (LOAD_COMPLETE, MOVE_TO_DEVICE, APPLY_OPTIMIZATIONS, FINALIZE)

## 3. Clean Up Old Files

- [x] 3.1 Delete `app/cores/model_loader/progress.py` (merged into steps.py)
- [x] 3.2 Remove step messages from `app/constants/model_loader.py`:
  - Remove `_MODEL_LOADING_PROGRESS_MESSAGES`
  - Remove `MODEL_LOADING_PROGRESS_STEPS`
  - Keep `SAFETY_CHECKER_MODEL`, `CLIP_IMAGE_PROCESSOR_MODEL`, `ModelLoadingStrategy`

## 4. Update Schema

- [x] 4.1 Update `app/schemas/model_loader.py`:
  - Change `total: int = Field(default=8)` (hardcoded to avoid circular import)
  - Remove `ModelLoaderProgressStep` class (no longer needed)

## 5. Update Tests

- [x] 5.1 Create `tests/app/cores/model_loader/test_steps.py`:
  - Test `ModelLoadStep` enum has 8 members
  - Test `TOTAL_STEPS == 8`
  - Test `STEP_CONFIG` has entry for each step
  - Test `emit_step` emits correct payload
- [x] 5.2 Update existing model loader tests to use new enum imports

## 6. Verification

- [x] 6.1 Run tests: `uv run pytest -q` (951 passed)
- [x] 6.2 Run type check: `uv run ty check` (All checks passed)
- [x] 6.3 Run linting: `uv run ruff format && uv run ruff check` (All checks passed)
- [ ] 6.4 Manual test: Load a model and verify 8 progress steps emit correctly
