# 008: Handle Missing model_index.json

**Feature:** Graceful fallback when model_index.json is missing
**Status:** ✅ Completed

---

## Problem

Some HuggingFace models don't have `model_index.json`, causing download failures.

---

## Solution

### 1. Repository Fallback

Update `HuggingFaceRepository.get_components`:
- Catch `EntryNotFoundError` from `hf_hub_download`
- Return empty list instead of raising
- Keep JSON parsing behavior (malformed files still raise)

### 2. DownloadService Fallback

In `DownloadService.download_model`:
- Detect when `get_components` returns empty list
- Log warning and fallback to downloading all files
- Default scopes to `['*']` in fallback mode

### 3. File Selection

- Simplify filtering logic for both flows
- Ensure deterministic ordering and size tracking

---

## Files Modified

- `app/features/downloads/repository.py` - get_components error handling
- `app/features/downloads/services.py` - Fallback logic

---

## Verification

```bash
uv run pytest tests/app/features/downloads/ -v
```
