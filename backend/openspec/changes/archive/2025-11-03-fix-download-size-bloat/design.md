# 005: Fix Download Size Bloat

**Feature:** Smart filtering to reduce download size from 15 GB to 4.3 GB
**Status:** ✅ Completed
**Issue:** #90

---

## Problem

Users reported download sizes 3x larger than UI promise:
- UI shows: 4.3 GB for SD 1.5
- Actual: 10-15 GB

### Root Cause

Model repositories contain bloat:
- Duplicate formats (.safetensors AND .bin)
- fp16 variants (half-precision)
- Training artifacts (non_ema, ema_only)

---

## Solution (Two Parts)

### Part 1: Download Service Filtering

Filter bloat during download:

```python
def get_ignore_components(self, files, scopes):
    # 1. Find dirs with standard .safetensors
    dirs_with_standard = set()
    for f in in_scope:
        if f.endswith('.safetensors') and not any(v in f for v in ['fp16', 'non_ema', 'ema_only']):
            dirs_with_standard.add(directory)

    # 2. Filter .bin in those dirs
    # 3. Filter ALL variants everywhere
```

### Part 2: Model Loader Reordering (CRITICAL)

Reorder strategies to try standard FIRST:

```python
# NEW ORDER:
# 1. Standard safetensors ← Uses what's in cache
# 2. Standard bin
# 3. fp16 safetensors ← Only if standard missing
# 4. fp16 bin
```

**Without Part 2:** Loader re-downloads fp16 from HuggingFace, defeating Part 1!

---

## Files Modified

1. `app/features/downloads/services.py` - get_ignore_components() filtering
2. `app/cores/model_loader/model_loader.py` - Strategy reordering

---

## Results

| Metric | Before | After |
|--------|--------|-------|
| SD 1.5 Download | 15 GB | 4.27 GB |
| Bloat Removed | 0 GB | 10.73 GB |
| Reduction | - | 71% |

---

## Verification

```bash
uv run pytest tests/app/features/downloads/test_services.py -v
uv run pytest tests/app/cores/model_loader/test_loader.py -v
```
