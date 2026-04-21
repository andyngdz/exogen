# Add Upscaler Recommendation and Method Fields

## Summary

Update the `Upscaler` type and UI to support new backend API fields (`method`, `is_recommended`) and display a "Recommended" chip for AI upscalers in the dropdown.

## Motivation

The backend `/config` API now returns additional upscaler metadata:

- `method`: Distinguishes between `"traditional"` (Lanczos, Bicubic, etc.) and `"ai"` (Real-ESRGAN models)
- `is_recommended`: Indicates recommended options for users

This enables better UX by highlighting AI-powered upscalers that produce higher quality results.

## Scope

- **New enum**: Add `UpscalerMethod` enum with `TRADITIONAL` and `AI` values
- **Type updates**: Extend `Upscaler` interface with `method` (using new enum) and `is_recommended` fields
- **Enum update**: Add new Real-ESRGAN upscaler values to `UpscalerType`
- **UI enhancement**:
  - Group upscalers by method using `SelectSection` (Traditional vs AI sections)
  - Display "Recommended" chip next to recommended upscalers in the dropdown

## Affected Areas

- `src/types/api.ts` - Type definitions
- `src/cores/constants.ts` - UpscalerType enum
- `src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaler.tsx` - Dropdown UI
- Related test files

## Dependencies

- Backend API already updated (no backend changes needed)

## Risks

- **Low**: Additive type changes, no breaking changes to existing functionality
