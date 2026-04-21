# Data Model: Backend Configuration Store

**Feature**: 009-backend-config
**Date**: 2025-11-28

## Entities

### BackendConfig

Root configuration object returned by the `/config/` API endpoint.

| Field     | Type         | Required | Description                                           |
| --------- | ------------ | -------- | ----------------------------------------------------- |
| upscalers | `Upscaler[]` | Yes      | Available image upscaling methods with their metadata |

**Notes**:

- Extensible: future config sections can be added as additional fields
- Empty arrays are valid

### Upscaler

Configuration for an image upscaling algorithm.

| Field                      | Type     | Required | Description                                                     |
| -------------------------- | -------- | -------- | --------------------------------------------------------------- |
| value                      | `string` | Yes      | Unique identifier (e.g., "Lanczos", "Bicubic") - stored in form |
| name                       | `string` | Yes      | Display name for dropdown (e.g., "Lanczos (High Quality)")      |
| description                | `string` | Yes      | Help text explaining the upscaler                               |
| suggested_denoise_strength | `number` | Yes      | Recommended denoising value (0.0 - 1.0) for first-time use      |

## TypeScript Definitions

```typescript
// src/types/index.ts

export interface Upscaler {
  value: string
  name: string
  description: string
  suggested_denoise_strength: number
}

export interface BackendConfig {
  upscalers: Upscaler[]
}
```

## Hook Architecture

### Two-Layer Pattern

```
┌─────────────────────────────────────────────────────────────┐
│  Component Layer                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ const { upscalers } = useConfig()                       ││
│  │ upscalers.map(u => <SelectItem key={u.value}>...)       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Wrapper Hook Layer (cores/hooks/useConfig.ts)              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ const useConfig = () => {                               ││
│  │   const { data } = useBackendConfigQuery()              ││
│  │   return { upscalers: data?.upscalers ?? [] }           ││
│  │ }                                                       ││
│  └─────────────────────────────────────────────────────────┘│
│  Returns: { upscalers: Upscaler[] }  (never undefined)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Query Hook Layer (cores/api-queries/queries.ts)            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ const useBackendConfigQuery = () => useQuery({          ││
│  │   queryKey: ['config'],                                 ││
│  │   queryFn: () => api.getConfig(),                       ││
│  │   staleTime: Infinity                                   ││
│  │ })                                                      ││
│  └─────────────────────────────────────────────────────────┘│
│  Returns: UseQueryResult<BackendConfig>                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  API Layer (services/api.ts)                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ async getConfig() {                                     ││
│  │   const { data } = await client.get<BackendConfig>('/config/')│
│  │   return data                                           ││
│  │ }                                                       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
App Start
    │
    ├── Component mounts → useConfig() called
    │       │
    │       └── useBackendConfigQuery() fires
    │               │
    │               └── GET /config/ → BackendConfig cached
    │
User toggles Hires.fix checkbox
    │
    └── Form displays immediately (Zustand values)
            │
            └── Upscaler dropdown uses useConfig().upscalers
                    │
                    └── Options rendered from cached config
```

## State Separation

| Data                    | Storage           | Access                  |
| ----------------------- | ----------------- | ----------------------- |
| Upscaler options (list) | React Query cache | `useConfig().upscalers` |
| Selected upscaler value | Zustand (form)    | `useFormContext()`      |
| Denoise strength value  | Zustand (form)    | `useFormContext()`      |

## useConfig() Return Type

```typescript
interface ConfigResult {
  upscalers: Upscaler[] // Never undefined, defaults to []
  // Future fields:
  // samplers: Sampler[]
  // schedulers: Scheduler[]
}
```

**Extensibility**: When backend adds new config types, add field to:

1. `BackendConfig` interface
2. `useConfig()` return with default value
3. Components can immediately use new field
