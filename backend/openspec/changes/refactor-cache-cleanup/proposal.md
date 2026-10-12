# Change: Refactor Device Cache Cleanup Utilities

## Why

Duplicate `torch.cuda.empty_cache()` blocks have spread across generation, safety checker, and GPU cleanup services. Each area clears GPU memory slightly differently (missing logging, no MPS fallback, no shared metrics), which makes maintenance harder and risks some features forgetting to release VRAM.

## What Changes

- Add a centralized GPU/MPS cache cleanup helper (likely under `app/cores/gpu_utils.py`) that wraps CUDA/MPS availability checks, logging, and timing metrics.
- Update generation subsystems (image processor, memory manager, progress callback, safety checker) and any other callers to use the shared helper instead of hand-written `torch.cuda.empty_cache()` snippets.
- Extend tests to cover the helper and its integrations, ensuring cache clearing is invoked conditionally for CUDA/MPS devices.

## Impact

- Affected specs: `model-manager`
- Affected code: `app/cores/gpu_utils.py`, `app/cores/generation/*` (memory manager, progress callback, image processor, safety checker service), related tests under `tests/app/cores/**`
