# Tasks

## 1. Add UpscalerMethod enum

- [x] Create `UpscalerMethod` enum in `src/cores/constants.ts`
- [x] Values: `TRADITIONAL = 'traditional'`, `AI = 'ai'`

## 2. Update UpscalerType enum

- [x] Add Real-ESRGAN variants to `src/cores/constants.ts`
- [x] Values: `RealESRGAN_x2plus`, `RealESRGAN_x4plus`, `RealESRGAN_x4plus_anime`

## 3. Extend Upscaler interface

- [x] Add `method: UpscalerMethod` field (using new enum)
- [x] Add `is_recommended: boolean` field
- [x] Update in `src/types/api.ts`

## 4. Update backend-config spec

- [x] Document new fields in spec
- [x] Update Key Entities section

## 5. Update GeneratorConfigHiresFixUpscaler component

- [x] Group upscalers by method using `SelectSection` from HeroUI
  - [x] "Traditional" section for traditional upscalers
  - [x] "AI" section for AI-powered upscalers
- [x] Add "Recommended" text next to upscaler name for items where `is_recommended: true`
- [x] Use description prop with styled span for recommendation indicator

## 6. Update tests

- [x] Add test for recommended text display
- [x] Update type-related test expectations in all affected test files
