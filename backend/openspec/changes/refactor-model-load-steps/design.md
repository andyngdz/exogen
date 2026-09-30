# Design: Centralized Model Load Steps

## Context

Model loading progress is emitted via Socket.IO to show users loading state. Steps are currently scattered across multiple files with hardcoded numbers and inline strings, making maintenance error-prone.

## Goals / Non-Goals

**Goals:**
- Single source of truth for all step definitions
- Type-safe step references (no magic numbers)
- Auto-derived total count
- Easy to add/remove/reorder steps

**Non-Goals:**
- Dynamic step registration at runtime
- Per-model step customization
- Step timing/duration tracking

## Decisions

### Decision 1: Use IntEnum for Steps

```python
class ModelLoadStep(IntEnum):
    INIT = 1
    CACHE_CHECK = 2
    BUILD_STRATEGIES = 3
    LOAD_WEIGHTS = 4
    LOAD_COMPLETE = 5
    MOVE_TO_DEVICE = 6
    APPLY_OPTIMIZATIONS = 7
    FINALIZE = 8
```

**Why IntEnum over StrEnum:**
- Step numbers needed for progress payload (`step=4`)
- IntEnum values are the step numbers directly
- No separate mapping from enum to int needed

**Why explicit values (1, 2, 3...) over auto():**
- Explicit shows the progression clearly
- Prevents accidental reordering breaking API
- Frontend may depend on specific step numbers

### Decision 2: Config Dict for Message/Phase

```python
STEP_CONFIG: dict[ModelLoadStep, tuple[str, ModelLoadPhase]] = {
    ModelLoadStep.INIT: ('Initializing model loader...', ModelLoadPhase.INITIALIZATION),
    ModelLoadStep.CACHE_CHECK: ('Checking model cache...', ModelLoadPhase.INITIALIZATION),
    # ...
}
```

**Why tuple over dataclass:**
- Only 2 fields (message, phase) - dataclass is overkill
- Unpacking is clean: `message, phase = STEP_CONFIG[step]`

### Decision 3: Derive TOTAL_STEPS

```python
TOTAL_STEPS = len(ModelLoadStep)
```

**Why:**
- Always accurate - add enum member, total updates automatically
- Used in schema default and emit_step

### Decision 4: Single emit_step Function

```python
def emit_step(model_id: str, step: ModelLoadStep, cancel_token: Optional[CancellationToken] = None) -> None:
    if cancel_token:
        cancel_token.check_cancelled()

    message, phase = STEP_CONFIG[step]
    progress = ModelLoadProgressResponse(
        model_id=model_id,
        step=step.value,
        total=TOTAL_STEPS,
        phase=phase,
        message=message,
    )
    logger.info(f'{model_id} step={step.value}/{TOTAL_STEPS} phase={phase.value} msg="{message}"')
    socket_service.model_load_progress(progress)
```

**Why integrate cancel_token:**
- Every emit site currently checks cancellation
- Reduces boilerplate at call sites
- Single responsibility: "emit step with cancellation check"

## File Structure

```
app/cores/model_loader/
├── steps.py          # NEW: ModelLoadStep enum, STEP_CONFIG, TOTAL_STEPS, emit_step()
├── model_loader.py   # Uses emit_step(model_id, ModelLoadStep.INIT, cancel_token)
├── strategies.py     # Uses emit_step(model_id, ModelLoadStep.LOAD_WEIGHTS, cancel_token)
├── setup.py          # Uses emit_step(model_id, ModelLoadStep.MOVE_TO_DEVICE, ...)
├── progress.py       # REMOVED: merged into steps.py
└── ...
```

## Migration Plan

1. Create `steps.py` with enum, config, and `emit_step()`
2. Update `model_loader.py`, `strategies.py`, `setup.py` to use new API
3. Remove `progress.py` (functionality moved to `steps.py`)
4. Remove step constants from `constants/model_loader.py`
5. Update `schemas/model_loader.py` to import `TOTAL_STEPS`
6. Update tests

## Risks / Trade-offs

**Risk:** Frontend depends on specific step numbers
**Mitigation:** Keep same step numbers (just removing step 2), document in API

**Trade-off:** More code in steps.py vs distributed
**Accepted:** Centralization worth the slightly larger file (~50 lines)
