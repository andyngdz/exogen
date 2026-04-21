# Implementation Plan: Backend Configuration Store

**Branch**: `009-backend-config` | **Date**: 2025-11-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-backend-config/spec.md`

## Summary

Fetch backend configuration from `/config/` API endpoint silently at app startup. Provide a `useConfig()` wrapper hook that returns config with default empty arrays, eliminating null-checking in components. The configuration provides upscaler options for the Hires.fix dropdown. Backend config only provides first-time defaults; user modifications in Zustand always take precedence. No loading states or fallback handling needed (local backend always available).

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Next.js 16
**Primary Dependencies**: TanStack Query 5.x, Zustand 5.x, Axios, HeroUI
**Storage**: N/A (React Query cache + existing Zustand persistence)
**Testing**: Vitest + React Testing Library
**Target Platform**: Electron desktop app (Windows, macOS, Linux)
**Project Type**: Web application (Next.js frontend + Python FastAPI backend - local)
**Performance Goals**: Form displays immediately (< 100ms), config fetch silent in background
**Constraints**: No loading states; no fallback handling; user preferences always preserved
**Scale/Scope**: Single config endpoint, upscalers for MVP, extensible for future config types

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                        | Status  | Notes                                                                     |
| -------------------------------- | ------- | ------------------------------------------------------------------------- |
| I. Type Safety First             | ✅ PASS | `BackendConfig`, `Upscaler` types; `useConfig()` returns typed object     |
| II. Test-First Development       | ✅ PASS | Tests for query hook and `useConfig()` wrapper                            |
| III. User Experience Consistency | ✅ PASS | No loading states (form uses persisted values); follows existing patterns |
| IV. Reactive State Architecture  | ✅ PASS | React Query for server state; existing Zustand for form persistence       |
| V. Simplicity Over Abstraction   | ✅ PASS | Two-layer hook pattern (query + wrapper); no fallback complexity          |

**Performance Standards**: Form displays immediately (< 100ms) - meets "UI interaction response < 100ms" requirement.

**Quality Gates**: All pre-commit gates will be satisfied (type-check, lint, format, test).

## Project Structure

### Documentation (this feature)

```text
specs/009-backend-config/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── cores/
│   ├── api-queries/
│   │   ├── queries.ts           # Add useBackendConfigQuery (internal)
│   │   └── index.ts             # Export useBackendConfigQuery
│   └── hooks/
│       ├── useConfig.ts         # NEW: useConfig() wrapper hook
│       └── index.ts             # Export useConfig
├── features/
│   ├── generator-config-hires/
│   │   └── presentations/
│   │       └── GeneratorConfigHiresFixUpscaler.tsx  # Use useConfig().upscalers
│   └── generator-config-formats/
│       └── states/
│           └── useGeneratorConfigFormats.ts  # Use useConfig() for defaults
├── services/
│   └── api.ts                   # Add getConfig() method
└── types/
    └── api.ts                   # Add BackendConfig, Upscaler types

tests/ (adjacent __tests__ folders)
├── src/cores/api-queries/__tests__/queries.test.ts
├── src/cores/hooks/__tests__/useConfig.test.ts
└── src/features/generator-config-hires/presentations/__tests__/GeneratorConfigHiresFixUpscaler.test.tsx
```

**Structure Decision**: Following existing feature-first architecture. Two-layer hook pattern:

1. `useBackendConfigQuery` in `cores/api-queries/` - internal React Query hook
2. `useConfig` in `cores/hooks/` - public wrapper with default values

## Complexity Tracking

> No constitution violations. Implementation follows established patterns.

| Area              | Approach                                  | Rationale                                                                       |
| ----------------- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| Hook Pattern      | Two layers: query + wrapper               | Query handles fetching; wrapper provides defaults                               |
| Loading States    | None                                      | Form uses persisted Zustand values; displays immediately                        |
| Fallback Handling | None                                      | Local backend always available; YAGNI                                           |
| Null Safety       | `useConfig()` returns `{ upscalers: [] }` | Components never see undefined                                                  |
| Denoise Strength  | Apply on upscaler change                  | Use backend's `suggested_denoise_strength` when user selects different upscaler |

## Implementation Status

This feature is **complete**. All tasks implemented:

- ✅ Types added (`BackendConfig`, `Upscaler` with `UpscalerType` enum in `src/types/api.ts`)
- ✅ API method added (`getConfig()` in `src/services/api.ts`)
- ✅ Query hook added (`useBackendConfigQuery` in `src/cores/api-queries/queries.ts`)
- ✅ Wrapper hook created (`useConfig()` in `src/cores/hooks/useConfig.ts`)
- ✅ Component updated (`GeneratorConfigHiresFixUpscaler.tsx` applies `suggested_denoise_strength` on change)
- ✅ Form defaults updated (`useGeneratorConfigFormats.ts` uses `first(upscalers)` for backend config defaults)
- ✅ Type-check, lint, format pass

**Implementation approach for `useGeneratorConfigFormats.ts`**:

```typescript
const onHiresFixToggle = (checked: boolean) => {
  const defaultUpscaler = first(upscalers) // Get from backend config
  toggleIsHiresFixEnabled(checked)

  if (checked) {
    register('hires_fix') // Always register when enabling

    if (!hiresFixValue && defaultUpscaler) {
      // Only set defaults for first-time users
      setValue('hires_fix', {
        upscale_factor: UpscaleFactor.TWO,
        upscaler: defaultUpscaler.value,
        denoising_strength: defaultUpscaler.suggested_denoise_strength,
        steps: 0
      })
    }
  } else {
    unregister('hires_fix')
  }
}
```

Key decisions:

- Use `first()` from es-toolkit inside the handler (cleaner than module-level variable)
- Always `register('hires_fix')` when enabling (outside the defaults check)
- Check `!hiresFixValue` only for setting default values (first-time users)
- Use `register()`/`unregister()` pattern to properly manage form field lifecycle

**Implementation approach for `GeneratorConfigHiresFixUpscaler.tsx`**:

```typescript
const onUpscalerChange = (upscalerValue: string) => {
  const selectedUpscaler = upscalers.find((u) => u.value === upscalerValue)

  if (selectedUpscaler) {
    setValue(
      'hires_fix.denoising_strength',
      selectedUpscaler.suggested_denoise_strength
    )
  }
}
```

Key decisions:

- Simple truthiness check on `selectedUpscaler` (cleaner than checking `!== undefined`)
- Apply `suggested_denoise_strength` every time user changes upscaler selection
- Uses `find()` to locate the selected upscaler from backend config
