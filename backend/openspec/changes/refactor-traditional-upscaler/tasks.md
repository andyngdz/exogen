# Tasks: Refactor Traditional Upscaler

## 1. Rename and Restructure

- [x] 1.1 Rename `app/cores/generation/upscaler.py` to `app/cores/generation/traditional_upscaler.py`
- [x] 1.2 Rename `tests/app/cores/generation/test_upscaler.py` to `tests/app/cores/generation/test_traditional_upscaler.py`

## 2. Move Refinement Logic

- [x] 2.1 Move `_run_refinement()` from `hires_fix.py` to `traditional_upscaler.py` as `refine()`
- [x] 2.2 Move step resolution logic to `traditional_upscaler.upscale_and_refine()` (only traditional upscalers need steps)
- [x] 2.3 Create `upscale_and_refine()` method that combines upscale + refine workflow

## 3. Update hires_fix.py

- [x] 3.1 Update imports to use `traditional_upscaler` and `realesrgan_upscaler`
- [x] 3.2 Simplify `apply()` to delegate to `traditional_upscaler.upscale_and_refine()` or `realesrgan_upscaler.upscale()`
- [x] 3.3 Remove moved methods (`_get_steps()` moved to traditional_upscaler)

## 4. Update Imports

- [x] 4.1 No `__init__.py` exports needed
- [x] 4.2 Updated test files to import from `traditional_upscaler`

## 5. Update Tests

- [x] 5.1 Update test imports to reference `traditional_upscaler` and `TraditionalUpscaler`
- [x] 5.2 Tests for `refine()` covered via `upscale_and_refine()` delegation tests
- [x] 5.3 Updated `test_hires_fix.py` to verify delegation to appropriate upscaler

## 6. Validation

- [x] 6.1 Run `ruff format && ruff check --fix` - all passed
- [x] 6.2 Run `uv run pytest` - 884 tests passed
