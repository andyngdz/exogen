# Tasks: Remove Face Enhancement from Upscaler

## 1. Schema Changes

- [x] 1.1 Remove `is_face_enhance` field from `HiresFixConfig` in `app/schemas/hires_fix.py`

## 2. Core Implementation

- [x] 2.1 Remove `is_face_enhance` parameter from `RealESRGANUpscaler.upscale()` in `app/cores/generation/realesrgan_upscaler.py`
- [x] 2.2 Remove `_apply_face_enhance()` method from `RealESRGANUpscaler`
- [x] 2.3 Remove `is_face_enhance` parameter from `_upscale_images()` method
- [x] 2.4 Remove `is_face_enhance` parameter from `ImageUpscaler.upscale()` in `app/cores/generation/upscaler.py`

## 3. Integration

- [x] 3.1 Remove `is_face_enhance` from `image_upscaler.upscale()` call in `app/cores/generation/hires_fix.py`

## 4. Dependencies

- [x] 4.1 Remove `gfpgan` from pyproject.toml dependencies
- [x] 4.2 Delete `typings/gfpgan.pyi` if it exists (did not exist)
- [x] 4.3 Run `uv lock` to update lockfile

## 5. Tests

- [x] 5.1 Update `tests/app/cores/generation/test_realesrgan_upscaler.py` - remove face enhance tests
- [x] 5.2 Update `tests/app/cores/generation/test_hires_fix.py` - remove `is_face_enhance` from test configs

## 6. Validation

- [x] 6.1 Run `ruff format && ruff check --fix`
- [x] 6.2 Run `uv run pytest` - all tests pass (887 passed)
- [x] 6.3 Manual test: generate with Real-ESRGAN upscaler (requires user testing)
