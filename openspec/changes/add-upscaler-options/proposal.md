# Add Upscaler Options to useConfig

## Summary

Extend `useConfig` to return `upscalerOptions` (flattened array) alongside `upscalers` (sections).

## Motivation

Currently, consumers need to flatten upscaler sections manually:

```typescript
const allOptions = upscalers.flatMap((section) => section.options)
const selectedOption = allOptions.find((o) => o.value === upscalerValue)
```

By adding `upscalerOptions` to `useConfig`, consumers can directly use the flattened array.

## Scope

- Extend `useConfig` to return `upscalerOptions`
- Simplify `useGeneratorConfigHiresFixUpscaler` to use `upscalerOptions`
- Simplify `useGeneratorConfigFormats` to use `upscalerOptions`

## Out of Scope

- API changes
- UI changes
- New hooks
