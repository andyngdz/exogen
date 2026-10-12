# 002: Fix macOS CUDA Dependencies

**Feature:** Enable macOS development by making CUDA dependencies conditional
**Status:** ✅ Completed

---

## Problem

Running `uv sync` on macOS ARM64 fails:
```
error: Distribution `nvidia-cublas-cu12==12.6.4.1` can't be installed because it doesn't have a wheel for the current platform
```

NVIDIA CUDA libraries are hardcoded but only have wheels for Linux/Windows.

---

## Solution

Add platform markers to make NVIDIA packages conditional:

```toml
# Before
"nvidia-cublas-cu12==12.6.4.1",

# After
"nvidia-cublas-cu12==12.6.4.1; sys_platform != 'darwin'",
```

---

## Files Modified

**`pyproject.toml`:**
- Add `; sys_platform != 'darwin'` to 14 NVIDIA CUDA packages
- Add `; sys_platform != 'darwin'` to `triton` package

---

## Affected Dependencies (15 packages)

1. nvidia-cublas-cu12
2. nvidia-cuda-cupti-cu12
3. nvidia-cuda-nvrtc-cu12
4. nvidia-cuda-runtime-cu12
5. nvidia-cudnn-cu12
6. nvidia-cufft-cu12
7. nvidia-cufile-cu12
8. nvidia-curand-cu12
9. nvidia-cusolver-cu12
10. nvidia-cusparse-cu12
11. nvidia-cusparselt-cu12
12. nvidia-nccl-cu12
13. nvidia-nvjitlink-cu12
14. nvidia-nvtx-cu12
15. triton

---

## Verification

```bash
# macOS
uv sync  # Should succeed
uv run pytest  # All tests pass with MPS/CPU

# Linux
uv sync  # Should install NVIDIA packages
```
