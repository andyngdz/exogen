# Change: Fix macOS CUDA Dependencies

## Why
CUDA dependencies were incorrectly included on macOS where they're not supported.

## What Changes
- Removed unnecessary CUDA dependencies for macOS builds
- Ensured MPS (Metal Performance Shaders) fallback works correctly

## Impact
- Affected code: Dependencies and platform detection
