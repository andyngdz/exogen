# Change: Refactor Model Load Progress Steps

## Why

Two problems with current implementation:

1. **Redundant step**: After removing safety checker from pipeline loading, step 2 ("Loading feature extractor...") no longer happens. Current 9-step flow has a step that doesn't reflect actual work.

2. **Scattered step definitions**: Step numbers and messages are hardcoded across 4+ files:
   - `constants/model_loader.py` - Steps 1-4 messages only
   - `model_loader.py` - Emits steps 1-4 with magic numbers
   - `strategies.py` - Emits step 5 with inline string
   - `setup.py` - Emits steps 6-9 with inline strings
   - `progress.py` - Phase mapping uses magic numbers, hardcoded `total=9`
   - `schemas/model_loader.py` - Default `total=9`

   Renumbering steps requires changes in 6 files - error-prone and unmaintainable.

## What Changes

**1. Remove redundant step 2** - "Loading feature extractor..." no longer happens

**2. Centralize all step definitions** in new `app/cores/model_loader/steps.py`:
   - `ModelLoadStep` enum with all 8 steps
   - `STEP_CONFIG` mapping step → (message, phase)
   - `TOTAL_STEPS = len(ModelLoadStep)` - automatically derived
   - `emit_step(model_id, step)` - looks up message/phase from config

**3. Final steps (9→8)**:

| Old | New | Enum | Message |
|-----|-----|------|---------|
| 1 | 1 | `INIT` | "Initializing model loader..." |
| 2 | REMOVED | - | "Loading feature extractor..." |
| 3 | 2 | `CACHE_CHECK` | "Checking model cache..." |
| 4 | 3 | `BUILD_STRATEGIES` | "Preparing loading strategies..." |
| 5 | 4 | `LOAD_WEIGHTS` | "Loading model weights..." |
| 6 | 5 | `LOAD_COMPLETE` | "Model loaded successfully" |
| 7 | 6 | `MOVE_TO_DEVICE` | "Moving model to device..." |
| 8 | 7 | `APPLY_OPTIMIZATIONS` | "Applying optimizations..." |
| 9 | 8 | `FINALIZE` | "Finalizing model setup..." |

## Impact

- Affected specs: `model-load-progress`
- New file: `app/cores/model_loader/steps.py`
- Modified files:
  - `app/cores/model_loader/model_loader.py` - Use `emit_step()` with enum
  - `app/cores/model_loader/strategies.py` - Use `emit_step()` with enum
  - `app/cores/model_loader/setup.py` - Use `emit_step()` with enum
  - `app/cores/model_loader/progress.py` - Remove, merged into steps.py
  - `app/constants/model_loader.py` - Remove step messages (moved to steps.py)
  - `app/schemas/model_loader.py` - Import `TOTAL_STEPS` for default

## Benefits

- **Single source of truth**: All step definitions in one file
- **No magic numbers**: Enum names prevent typos, enable IDE autocomplete
- **Auto-derived total**: `TOTAL_STEPS = len(ModelLoadStep)` never out of sync
- **Easy to modify**: Add/remove/reorder steps by editing one file
