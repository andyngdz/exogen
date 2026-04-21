# Proposal: Add Memory Fields to Config API

## Summary

Extend the `BackendConfig` interface to include memory-related fields and remove the deprecated `/hardware/memory` endpoint support.

## Motivation

The backend API has consolidated memory information into the `/config/` endpoint:

- `gpu_scale_factor` - Current GPU memory scale factor (0.0-1.0)
- `ram_scale_factor` - Current RAM scale factor (0.0-1.0)
- `total_gpu_memory` - Total GPU memory in bytes
- `total_ram_memory` - Total RAM memory in bytes

The `/hardware/memory` endpoint has been removed from the backend.

## Current State

The `BackendConfig` interface only includes:

```typescript
export interface BackendConfig {
  upscalers: UpscalerSection[]
  safety_check_enabled: boolean
}
```

A separate `useMemoryQuery()` fetches from the now-removed `/hardware/memory` endpoint.

## Proposed Changes

1. **Add fields to `BackendConfig`** interface with the four new memory-related fields
2. **Remove deprecated memory endpoint support**:
   - Delete `api.getMemory()` method
   - Delete `useMemoryQuery()` hook
   - Delete `MemoryResponse` type
3. **Update `useConfig()` hook** to provide default values for new fields
4. **Update `MaxMemoryScaleFactorPreview`** to use config data instead of removed memory query

## Impact

- **Breaking change**: Removes `useMemoryQuery()` - but this is intentional as the endpoint no longer exists
- **Improved efficiency**: Single config query provides all memory information
