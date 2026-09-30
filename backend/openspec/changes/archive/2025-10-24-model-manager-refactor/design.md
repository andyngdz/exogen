# 001: Model Manager Refactor

**Feature:** Refactor monolithic ModelManager into Facade Pattern architecture
**Status:** ✅ Completed
**Tests:** 454/454 passing

---

## Problem

The original `ModelManager` class was a 485-line monolith handling multiple responsibilities:

- State management, GPU/MPS memory cleanup, pipeline storage, async loading orchestration

This caused: hard to test, difficult to debug, race conditions, resource leaks.

---

## Solution

Refactor into **Facade Pattern** with specialized managers:

```
ModelManager (Facade - 162 lines)
├── StateManager (86 lines)         - State machine & transitions
├── ResourceManager (73 lines)      - GPU/MPS memory cleanup
├── PipelineManager (98 lines)      - Pipeline storage & config
└── LoaderService (221 lines)       - Async orchestration & cancellation
```

---

## Architecture

### Before: Monolithic

```python
class ModelManager:
    # 485 lines mixing all concerns
    def load_model_async()      # orchestration + state + pipeline
    def unload_model_async()    # cleanup + state + resources
```

### After: Modular Facade

```python
class ModelManager:
    def __init__(self):
        self.state_manager = StateManager()
        self.resource_manager = ResourceManager()
        self.pipeline_manager = PipelineManager()
        self.loader_service = LoaderService(...)
```

---

## Files Created

1. `app/cores/model_manager/state_manager.py` - State machine
2. `app/cores/model_manager/loader_service.py` - Async orchestration
3. `app/cores/model_manager/pipeline_manager.py` - Pipeline storage
4. `app/cores/model_manager/resource_manager.py` - GPU cleanup

## Files Modified

1. `app/cores/model_manager/model_manager.py` - Converted to facade
2. `main.py` - Added executor shutdown lifecycle

---

## Bugs Fixed

1. **Resource Leak** - ThreadPoolExecutor never shut down → Added `shutdown()` method
2. **Race Conditions** - TOCTOU vulnerabilities → Proper lock pattern
3. **Stale State** - Variable caching → Direct property access
4. **Dead Code** - CANCELLING state never set → Removed

---

## API Changes

```python
# OLD
state = model_manager.get_state()
size = model_manager.get_sample_size()

# NEW
state = model_manager.current_state
size = model_manager.sample_size
```

---

## Verification

```bash
uv run pytest tests/app/cores/model_manager/ -v
uv run ty check app/cores/model_manager/
```
