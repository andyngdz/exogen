# Research: Backend Configuration Store

**Feature**: 009-backend-config
**Date**: 2025-11-28

## Research Summary

All technical decisions are straightforward. The key architectural decision is the two-layer hook pattern: internal query hook + public wrapper with defaults. No fallback handling needed (local backend always available).

## Decisions

### 1. Hook Architecture

**Decision**: Two-layer hook pattern

```typescript
// Layer 1: Internal query hook (cores/api-queries)
const useBackendConfigQuery = () => useQuery<BackendConfig>({...})

// Layer 2: Public wrapper hook (cores/hooks)
const useConfig = () => {
  const { data } = useBackendConfigQuery()
  return {
    upscalers: data?.upscalers ?? []
  }
}
```

**Rationale**:

- Query hook handles fetching, caching, retries (TanStack Query responsibility)
- Wrapper hook provides default empty arrays, eliminating null-checking
- Components use `useConfig()` directly - clean, simple API
- Extensible: add new config fields to wrapper as backend grows

**Alternatives Considered**:

- Single combined hook: Rejected - mixes concerns (fetching vs defaults)
- Direct query usage in components: Rejected - requires null-checking everywhere

### 2. No Fallback Handling

**Decision**: No fallback defaults for config fetch failures

**Rationale**:

- Local backend is always available (Electron bundles frontend + backend)
- If backend crashes, entire app is unusable anyway
- Fallback code would never execute in practice
- YAGNI principle (Constitution V)

**Alternatives Considered**:

- Hardcoded fallback constants: Rejected - over-engineering for impossible scenario
- Error boundary fallback: Rejected - backend crash = app crash regardless

### 3. No Loading States

**Decision**: Form displays immediately, no loading indicators for config

**Rationale**:

- Config fetches silently at app start
- Form uses persisted Zustand values (already available)
- By the time user opens Hires.fix, config is cached
- Loading states would cause unnecessary layout shift

**Alternatives Considered**:

- Skeleton while loading: Rejected - form already has values
- Block until loaded: Rejected - poor UX, unnecessary delay

### 4. Query Configuration

**Decision**: `staleTime: Infinity`, fetch once at app start

**Rationale**:

- Config doesn't change during a session
- Single fetch at initialization is sufficient
- React Query caches indefinitely with `staleTime: Infinity`

**Alternatives Considered**:

- Periodic refetch: Rejected - config is static
- Manual invalidation: Rejected - no use case

### 5. File Locations

**Decision**:

- `useConfig.ts` in `cores/hooks/` (new file)
- `useBackendConfigQuery` in `cores/api-queries/queries.ts` (existing file)

**Rationale**:

- Follows existing codebase patterns
- `cores/hooks/` already has shared hooks (`useDownloadedModels`, `useStyleSections`)
- Query hooks live in `cores/api-queries/`

## Best Practices Applied

### TanStack Query

- `queryKey: ['config']` for cache key
- `staleTime: Infinity` - config doesn't change during session
- Default retry behavior (3 retries with exponential backoff)

### TypeScript

- Strict types for `BackendConfig` and `Upscaler`
- `useConfig()` return type is `{ upscalers: Upscaler[] }`
- No `any` types

### Testing

- Test `useConfig()` returns empty array when query loading
- Test `useConfig()` returns data when query succeeds
- Test component renders with empty upscalers array

## Implementation Summary

Files to create/modify:

1. `src/types/index.ts` - Add types
2. `src/services/api.ts` - Add `getConfig()` method
3. `src/cores/api-queries/queries.ts` - Add `useBackendConfigQuery`
4. `src/cores/hooks/useConfig.ts` - NEW: `useConfig()` wrapper
5. `src/cores/hooks/index.ts` - Export `useConfig`
6. `src/features/.../GeneratorConfigHiresFixUpscaler.tsx` - Use `useConfig().upscalers`

No architectural complexity; follows established patterns.
