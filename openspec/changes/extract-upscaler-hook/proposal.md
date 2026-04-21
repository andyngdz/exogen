# Extract Upscaler Hook

## Summary

Extract upscaler grouping and change handling logic from `GeneratorConfigHiresFixUpscaler` component into a dedicated `useGeneratorConfigHiresFixUpscaler` hook.

## Motivation

Following the project's feature-first architecture pattern, business logic should be separated from presentation components. This refactoring:

- Improves testability by isolating logic in a hook
- Follows existing patterns (e.g., `useGeneratorConfigFormats` in states folder)
- Makes the presentation component purely focused on rendering

## Scope

- Create new `states` folder under `generator-config-hires` feature
- Extract `groupedUpscalers` memoization and `onUpscalerChange` handler to new hook
- Simplify the presentation component to consume the hook

## Affected Areas

- `src/features/generator-config-hires/states/useGeneratorConfigHiresFixUpscaler.ts` (new)
- `src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaler.tsx` (simplified)
- `src/features/generator-config-hires/index.ts` (export new hook)

## Dependencies

None - internal refactoring only

## Risks

- **Low**: Pure refactoring, no behavior change
