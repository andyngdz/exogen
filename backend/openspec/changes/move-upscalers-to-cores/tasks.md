# Tasks: Refactor Upscalers into Dedicated Core Module

## Prerequisites

- [x] Verify clean git status

## 1. Create Module Structure

- [x] Create `app/cores/upscalers/__init__.py`
- [x] Create `app/cores/upscalers/realesrgan/__init__.py`
- [x] Create `app/cores/upscalers/traditional/__init__.py`

## 2. Refactor Real-ESRGAN (can parallelize 2.1-2.3)

- [x] 2.1 Create `app/cores/upscalers/realesrgan/resource_manager.py`
  - Extract `_cleanup()` method
  - Create `RealESRGANResourceManager` class

- [x] 2.2 Create `app/cores/upscalers/realesrgan/model_manager.py`
  - Extract `_get_model_path()`, `_load_model()`, `_create_network()`
  - Create `RealESRGANModelManager` class

- [x] 2.3 Create `app/cores/upscalers/realesrgan/upscaler.py`
  - Keep `upscale()`, `_upscale_images()`, `_resize_to_target_scale()`
  - Import and use model_manager and resource_manager
  - Create `RealESRGANUpscaler` class
  - Export `realesrgan_upscaler` instance

- [x] 2.4 Update `app/cores/upscalers/realesrgan/__init__.py` with exports

## 3. Refactor Traditional Upscaler

- [x] 3.1 Create `app/cores/upscalers/traditional/refiner.py`
  - Extract `refine()` method
  - Create `Img2ImgRefiner` class

- [x] 3.2 Create `app/cores/upscalers/traditional/upscaler.py`
  - Keep `upscale()`, `_upscale_pil()`
  - Import and use refiner
  - Create `TraditionalUpscaler` class
  - Export `traditional_upscaler` instance

- [x] 3.3 Update `app/cores/upscalers/traditional/__init__.py` with exports

## 4. Update Imports

- [x] Update `app/cores/generation/hires_fix.py` imports

## 5. Cleanup Old Files

- [x] Delete `app/cores/generation/traditional_upscaler.py`
- [x] Delete `app/cores/generation/realesrgan_upscaler.py`

## 6. Refactor Tests

### 6.1 Create Test Structure
- [x] Create `tests/app/cores/upscalers/__init__.py`
- [x] Create `tests/app/cores/upscalers/realesrgan/__init__.py`
- [x] Create `tests/app/cores/upscalers/traditional/__init__.py`

### 6.2 Migrate Real-ESRGAN Tests
- [x] Create `tests/app/cores/upscalers/realesrgan/test_upscaler.py`
- [x] Create `tests/app/cores/upscalers/realesrgan/test_model_manager.py`
- [x] Create `tests/app/cores/upscalers/realesrgan/test_resource_manager.py`
- [x] Delete `tests/app/cores/generation/test_realesrgan_upscaler.py`

### 6.3 Migrate Traditional Tests
- [x] Create `tests/app/cores/upscalers/traditional/test_upscaler.py`
- [x] Create `tests/app/cores/upscalers/traditional/test_refiner.py`
- [x] Delete `tests/app/cores/generation/test_traditional_upscaler.py`

## 7. Validation

- [x] Run `uv run ruff format` - passes
- [x] Run `uv run ruff check` - passes
- [x] Run `uv run ty check` - passes
- [x] Run `uv run pytest tests/app/cores/upscalers/` - all tests pass (26 tests)
- [x] Run `uv run pytest tests/app/cores/generation/test_hires_fix.py` - tests pass (5 tests)
- [x] Run full test suite `uv run pytest` - all tests pass (887 tests)

## Notes

- Sections 2.1-2.3 can be done in parallel
- Section 4 depends on sections 2 and 3 being complete
- Section 5 depends on section 4 (imports updated before deleting old files)
- Section 6 can be done after section 5
