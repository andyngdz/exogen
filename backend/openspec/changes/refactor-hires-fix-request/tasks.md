## 1. Implementation
- [x] 1.1 Add `HiresFixRequest` schema
- [x] 1.2 Refactor hires fix processor to accept `HiresFixRequest`
- [x] 1.3 Refactor traditional upscaler/refiner to accept `HiresFixRequest`
- [x] 1.4 Update text-to-image hires fix callsite to pass final processed prompts
- [x] 1.5 Add `hires_fix` support to img2img using the shared hires fix processor

## 2. Tests
- [x] 2.1 Update hires fix processor tests
- [x] 2.2 Update traditional upscaler/refiner tests
- [x] 2.3 Update generator hires fix tests (processed prompts + call order)
- [x] 2.4 Add img2img hires fix tests

## 3. Verification
- [x] 3.1 Run `uv run pytest`

## 4. Refactoring
- [x] 4.1 Extract `_apply_hires_fix` helper in `base_img2img.py` (consistent with `base_generator.py`)

