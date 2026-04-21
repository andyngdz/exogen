# Change: Set Hires Fix Defaults to 2x Real-ESRGAN

## Why

Users currently have no default values for Hires Fix settings when enabling the feature for the first time. This requires manual configuration before generating upscaled images. Setting sensible defaults (2x upscale factor with Real-ESRGAN x2plus) provides a better first-time user experience with AI-powered upscaling.

## What Changes

- Update `onHiresFixToggle` in `useGeneratorConfigFormats` to apply defaults when user enables Hires Fix
- Set default upscale factor to `2x` (UpscaleFactor.TWO)
- Set default upscaler to `RealESRGAN_x2plus` (UpscalerType.REAL_ESRGAN_X2_PLUS) with fallback to first available upscaler
- Keep denoising strength and steps automatic (using backend-provided suggested values)

## Impact

- Affected specs: `generator-defaults` (new capability)
- Affected code:
  - `src/features/generator-config-formats/states/useGeneratorConfigFormats.ts` - Update toggle logic to prefer RealESRGAN_x2plus
  - `src/features/generator-config-formats/states/__tests__/useGeneratorConfigFormats.test.ts` - Update tests
- User impact: First-time Hires Fix users see pre-filled AI upscaler settings when they enable the checkbox (form stays closed by default)
- Backward compatibility: Existing users with localStorage values are unaffected (localStorage takes precedence)
