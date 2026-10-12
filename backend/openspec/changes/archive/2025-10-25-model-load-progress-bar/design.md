# 003: Model Load Progress Bar

**Feature:** Real-time progress updates for model loading via WebSocket
**Status:** ✅ Completed
**Dependencies:** Socket.IO infrastructure

---

## Problem

No feedback during model loading (30s to several minutes):
- Users don't know if loading is progressing or stuck
- No visibility into which stage is happening
- Poor UX compared to other AI tools

---

## Solution

Add real-time progress via WebSocket using existing 9 checkpoint infrastructure.

### Progress Phases

```python
class ModelLoadPhase(str, Enum):
    INITIALIZATION = 'initialization'     # Checkpoints 1-2
    LOADING_MODEL = 'loading_model'       # Checkpoints 3-5
    DEVICE_SETUP = 'device_setup'         # Checkpoints 6-7
    OPTIMIZATION = 'optimization'         # Checkpoints 8-9
```

### Checkpoint Mapping

| Step | Phase | Message | % |
|------|-------|---------|---|
| 1 | INITIALIZATION | "Initializing model loader..." | 11% |
| 2 | INITIALIZATION | "Loading feature extractor..." | 22% |
| 3 | LOADING_MODEL | "Checking model cache..." | 33% |
| 4 | LOADING_MODEL | "Preparing loading strategies..." | 44% |
| 5 | LOADING_MODEL | "Loading model weights..." | 56% |
| 6 | DEVICE_SETUP | "Model loaded successfully" | 67% |
| 7 | DEVICE_SETUP | "Moving model to device..." | 78% |
| 8 | OPTIMIZATION | "Applying optimizations..." | 89% |
| 9 | OPTIMIZATION | "Finalizing model setup..." | 100% |

---

## Files Created

1. `app/cores/model_loader/schemas.py` - ModelLoadPhase enum + ModelLoadProgressResponse
2. Socket events: MODEL_LOAD_STARTED, MODEL_LOAD_PROGRESS

## Files Modified

1. `app/socket/schemas.py` - Add new events
2. `app/socket/service.py` - Add model_load_started(), model_load_progress() methods
3. `app/cores/model_loader/model_loader.py` - Add map_step_to_phase(), emit_progress(), insert at checkpoints

---

## Implementation

```python
def emit_progress(model_id: str, step: int, message: str) -> None:
    try:
        phase = map_step_to_phase(step)
        progress = ModelLoadProgressResponse(
            id=model_id, step=step, total=9, phase=phase, message=message
        )
        socket_service.model_load_progress(progress)
    except Exception as e:
        logger.warning(f'Failed to emit progress: {e}')
```

---

## Verification

```bash
uv run pytest tests/app/cores/model_loader/test_model_load_progress.py -v
```
