# Implementation Tasks

## 1. Update Hires Fix Toggle Logic

- [x] 1.1 Update `onHiresFixToggle` in `src/features/generator-config-formats/states/useGeneratorConfigFormats.ts`
  - Prefer `RealESRGAN_x2plus` when available
  - Fallback to first upscaler if RealESRGAN_x2plus not found
  - Set `upscale_factor: UpscaleFactor.TWO`
  - Use backend-suggested denoising strength and automatic steps (0)

## 2. Update Tests

- [x] 2.1 Update `src/features/generator-config-formats/states/__tests__/useGeneratorConfigFormats.test.ts`
  - Add RealESRGAN upscalers to mock data
  - Update test expectations to verify RealESRGAN_x2plus is preferred
  - Add fallback test when RealESRGAN_x2plus unavailable
- [x] 2.2 Update `src/features/generators/constants/__tests__/generator.test.ts`
  - Remove hires_fix tests from FORM_DEFAULT_VALUES
  - Add test verifying hires_fix is undefined by default

## 3. Validation

- [x] 3.1 Run `pnpm run type-check` - ensure no TypeScript errors
- [x] 3.2 Run `pnpm run lint` - ensure ESLint passes
- [x] 3.3 Run `pnpm test -- src/features/generator-config-formats` - verify format tests pass (15/15 tests passed)
- [x] 3.4 Run `pnpm test -- src/features/generators/constants` - verify generator constant tests pass (7/7 tests passed)
- [x] 3.5 Manual test: Enable Hires Fix checkbox, verify 2x + RealESRGAN_x2plus defaults appear
