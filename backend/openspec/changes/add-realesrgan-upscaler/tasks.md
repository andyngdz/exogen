# Tasks: Add Real-ESRGAN AI Upscaler

## 1. Dependencies

- [x] 1.1 Add realesrgan, gfpgan, basicsr, facexlib, pypdl to pyproject.toml
- [x] 1.2 Create typings/realesrgan.pyi type stubs
- [x] 1.3 Create typings/gfpgan.pyi type stubs (if needed)
- [x] 1.4 Create typings/pypdl.pyi type stubs (if needed)

## 2. Schema Updates

- [x] 2.1 Extend UpscalerType enum with Real-ESRGAN variants in app/schemas/hires_fix.py
- [x] 2.2 Add is_face_enhance field to HiresFixConfig
- [x] 2.3 Add UpscalingMethod enum (TRADITIONAL | AI) to app/schemas/config.py
- [x] 2.4 Add method field to UpscalerItem schema
- [x] 2.5 Create RemoteModel schema for downloadable models (url, filename, scale)

## 3. Core Implementation

- [x] 3.1 Create app/cores/generation/realesrgan_upscaler.py with RealESRGANUpscaler class
- [x] 3.2 Implement model download with pypdl (get_model_path)
- [x] 3.3 Implement \_load_model() for each model type
- [x] 3.4 Implement upscale() with PIL → numpy → upscale → PIL conversion
- [x] 3.5 Implement post-upscale resize for non-native scales (e.g., 3x with 4x model)
- [x] 3.6 Implement \_apply_face_enhance() using GFPGAN
- [x] 3.7 Implement \_cleanup() using ResourceManager patterns

## 4. Integration

- [x] 4.1 Create app/constants/upscalers.py with PIL_UPSCALERS, REALESRGAN_UPSCALERS, REALESRGAN_MODELS
- [x] 4.2 Modify ImageUpscaler.upscale() to route based on set membership (import from constants)
- [x] 4.3 Update HiresFixProcessor to pass is_face_enhance to upscaler
- [x] 4.4 Update config service to include new upscaler options with metadata

## 5. Testing

- [x] 5.1 Create tests/app/cores/generation/test_realesrgan_upscaler.py
- [x] 5.2 Test model loading/unloading (mock RealESRGANer)
- [x] 5.3 Test upscale() with mocked model
- [x] 5.4 Test is_face_enhance flag handling
- [x] 5.5 Test cleanup is called after upscaling
- [x] 5.6 Update tests/app/cores/generation/test_upscaler.py for delegation

## 6. Validation

- [x] 6.1 Run ty check - verify no type errors
- [x] 6.2 Run ruff format && ruff check --fix
- [x] 6.3 Run pytest - all tests pass (884 passed)
- [x] 6.4 Manual test: generate with Real-ESRGAN upscaler (requires user testing)
- [x] 6.5 ~~Manual test: generate with is_face_enhance enabled~~ (removed by remove-face-enhance change)
