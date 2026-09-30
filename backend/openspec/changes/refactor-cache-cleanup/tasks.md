# Tasks: Refactor Device Cache Cleanup Utilities

## 1. Shared Helper

- [x] 1.1 Add a `clear_device_cache()` helper in `app/cores/gpu_utils.py` that:
  - Detects CUDA vs MPS availability
  - Logs when cache clears (and when no accelerator is present)
  - Provides optional metrics/timing hooks for callers

## 2. Generation + Safety Services

- [x] 2.1 Update `app/cores/generation/image_processor.py` to reuse the helper inside `clear_tensor_cache()`
- [x] 2.2 Update `app/cores/generation/memory_manager.py` and `progress_callback.py` to reuse the helper instead of inline CUDA checks
- [x] 2.3 Update `app/cores/generation/safety_checker_service.py` to reuse the helper during `_unload`

## 3. Tests

- [x] 3.1 Add unit tests for the helper covering CUDA, MPS, and CPU-only scenarios (`tests/app/cores/test_gpu_utils.py`)
- [x] 3.2 Update affected generation tests (memory manager, image processor, safety checker service, progress callback) to assert the helper is invoked

## 4. Validation

- [x] 4.1 Run `uv run pytest -q`
- [x] 4.2 Run `uv run ty check`
- [x] 4.3 Run `uv run ruff format && uv run ruff check`
