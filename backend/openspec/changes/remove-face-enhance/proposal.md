# Proposal: Remove Face Enhancement from Upscaler

## Summary

Remove the `is_face_enhance` parameter and GFPGAN integration from the upscaler chain. Face enhancement will be implemented as a separate Image2Image feature in a future change.

## Motivation

- Face enhancement is a post-processing operation, not an upscaling concern
- Separating it allows more flexibility (apply to any image, not just during generation)
- Keeps the upscaler focused on a single responsibility
- The frontend will have a dedicated Image2Image tab for enhancement features

## Scope

**Remove:**
- `HiresFixConfig.is_face_enhance` field
- `is_face_enhance` parameter from `ImageUpscaler.upscale()`
- `is_face_enhance` parameter from `RealESRGANUpscaler.upscale()`
- `_apply_face_enhance()` method from `RealESRGANUpscaler`
- `gfpgan` dependency from pyproject.toml
- `typings/gfpgan.pyi` type stubs (if exists)

**Update:**
- All call sites passing `is_face_enhance`
- All related tests

## Files Affected

- `app/schemas/hires_fix.py` - Remove field
- `app/cores/generation/upscaler.py` - Remove parameter
- `app/cores/generation/realesrgan_upscaler.py` - Remove parameter and method
- `app/cores/generation/hires_fix.py` - Remove parameter from call
- `pyproject.toml` - Remove gfpgan dependency
- `typings/gfpgan.pyi` - Delete file
- `tests/app/cores/generation/test_realesrgan_upscaler.py` - Update tests
- `tests/app/cores/generation/test_hires_fix.py` - Update tests

## Risk

Low - removing unused feature before release.
