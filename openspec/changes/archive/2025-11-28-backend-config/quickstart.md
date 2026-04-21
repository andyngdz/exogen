# Quickstart: Backend Configuration Store

**Feature**: 009-backend-config
**Date**: 2025-11-28

## Overview

Fetch backend configuration silently at app startup. Provide `useConfig()` hook that returns config with default empty arrays. No loading states, no fallback handling (local backend always available).

## Prerequisites

- Backend running with `/config/` endpoint available
- Frontend development environment set up (`pnpm install`)

## Key Files to Create/Modify

| File                                                   | Change                                |
| ------------------------------------------------------ | ------------------------------------- |
| `src/types/index.ts`                                   | Add `BackendConfig`, `Upscaler` types |
| `src/services/api.ts`                                  | Add `getConfig()` method              |
| `src/cores/api-queries/queries.ts`                     | Add `useBackendConfigQuery` hook      |
| `src/cores/hooks/useConfig.ts`                         | **NEW**: `useConfig()` wrapper hook   |
| `src/cores/hooks/index.ts`                             | Export `useConfig`                    |
| `src/features/.../GeneratorConfigHiresFixUpscaler.tsx` | Use `useConfig().upscalers`           |

## Implementation Steps

### 1. Add Types

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

### 2. Add API Method

```typescript
// src/services/api.ts
async getConfig() {
  const { data } = await client.get<BackendConfig>('/config/')
  return data
}
```

### 3. Add Query Hook

```typescript
// src/cores/api-queries/queries.ts
import { BackendConfig } from '@/types'

const useBackendConfigQuery = () => {
  return useQuery<BackendConfig>({
    queryKey: ['config'],
    queryFn: () => api.getConfig(),
    staleTime: Infinity
  })
}

export { useBackendConfigQuery }
```

### 4. Create useConfig() Wrapper Hook (NEW FILE)

```typescript
// src/cores/hooks/useConfig.ts
'use client'

import { useBackendConfigQuery } from '@/cores/api-queries'
import { Upscaler } from '@/types'

interface ConfigResult {
  upscalers: Upscaler[]
}

export const useConfig = (): ConfigResult => {
  const { data } = useBackendConfigQuery()

  return {
    upscalers: data?.upscalers ?? []
  }
}
```

### 5. Export useConfig

```typescript
// src/cores/hooks/index.ts
export { useConfig } from './useConfig'
```

### 6. Update Component

```typescript
// GeneratorConfigHiresFixUpscaler.tsx
import { useConfig } from '@/cores/hooks'

export const GeneratorConfigHiresFixUpscaler = () => {
  const { control } = useFormContext<GeneratorConfigFormValues>()
  const { upscalers } = useConfig()

  return (
    <Controller
      name="hires_fix.upscaler"
      control={control}
      render={({ field }) => (
        <Select
          label="Upscaler"
          selectedKeys={[field.value]}
          onSelectionChange={(keys) => {
            const selectedKey = keys.currentKey
            if (selectedKey) {
              field.onChange(selectedKey)
            }
          }}
          aria-label="Upscaler"
          size="sm"
        >
          {upscalers.map((upscaler) => (
            <SelectItem key={upscaler.value}>{upscaler.name}</SelectItem>
          ))}
        </Select>
      )}
    />
  )
}
```

**Key point**: No null-checking needed - `upscalers` is always an array (empty if loading).

## Testing

```bash
# Run specific tests
pnpm test -- src/cores/api-queries/__tests__/queries.test.ts
pnpm test -- src/cores/hooks/__tests__/useConfig.test.ts

# Run all tests
pnpm test

# Type check
pnpm run type-check
```

## Verification Checklist

- [ ] `pnpm run type-check` passes
- [ ] `pnpm run lint` passes
- [ ] `pnpm test` passes
- [ ] Upscaler dropdown shows options from backend
- [ ] Form displays immediately when Hires.fix checkbox clicked (no delay)
- [ ] User-modified values persist after app restart

## Test Scenarios

### Scenario 1: First-time User

1. Fresh install (no persisted state)
2. Click Hires.fix checkbox
3. **Expected**: Form shows with backend-provided defaults

### Scenario 2: Returning User

1. Modify upscaler selection
2. Restart app
3. Click Hires.fix checkbox
4. **Expected**: Form shows user's previous values

### Scenario 3: Empty Config (edge case)

1. Backend returns `{ upscalers: [] }`
2. Click Hires.fix checkbox
3. **Expected**: Empty dropdown renders (no crash)

## Common Issues

**Issue**: `useConfig is not exported`
**Solution**: Ensure `src/cores/hooks/index.ts` exports `useConfig`

**Issue**: Type errors with `Upscaler`
**Solution**: Ensure type is exported from `src/types/index.ts`

**Issue**: Dropdown empty
**Solution**: Check `useBackendConfigQuery` is fetching; verify backend `/config/` endpoint
