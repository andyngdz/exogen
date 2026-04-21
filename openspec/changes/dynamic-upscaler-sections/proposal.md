# Dynamic Upscaler Sections

## Summary

Update frontend to consume new backend API structure where `upscalers` is now an array of sections (each with `method`, `title`, and `options`), and dynamically render sections.

## Motivation

Backend now provides pre-grouped sections with titles. This change:

- Removes hardcoded section names from frontend
- Makes frontend fully data-driven
- Adding new upscaler categories only requires backend changes

## New API Structure

```json
{
  "upscalers": [
    {
      "method": "traditional",
      "title": "Traditional",
      "options": [
        { "value": "Lanczos", "name": "...", "suggested_denoise_strength": 0.4, ... }
      ]
    },
    {
      "method": "ai",
      "title": "AI",
      "options": [
        { "value": "RealESRGAN_x2plus", "name": "...", "is_recommended": true, ... }
      ]
    }
  ]
}
```

## Scope

- Update `Upscaler` type to `UpscalerOption` (individual upscaler)
- Add `UpscalerSection` type with `method`, `title`, `options`
- Update `BackendConfig.upscalers` to be `UpscalerSection[]`
- Update hook to expose sections and flatten options for lookups
- Update component to dynamically render `SelectSection` from sections array

## Affected Areas

- `src/types/api.ts` - Update types
- `src/cores/constants.ts` - Keep enums (still valid)
- `src/cores/hooks/useConfig.ts` - Update default
- `src/features/generator-config-hires/states/useGeneratorConfigHiresFixUpscaler.ts`
- `src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaler.tsx`
- Related test files

## Risks

- **Low**: Same visual output, cleaner implementation
