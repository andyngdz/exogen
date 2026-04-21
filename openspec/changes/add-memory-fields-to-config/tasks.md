# Tasks

## 1. Update BackendConfig interface

- [x] Add `gpu_scale_factor: number` to `BackendConfig` in `src/types/api.ts`
- [x] Add `ram_scale_factor: number` to `BackendConfig`
- [x] Add `total_gpu_memory: number` to `BackendConfig`
- [x] Add `total_ram_memory: number` to `BackendConfig`

## 2. Remove deprecated memory endpoint support

- [x] Delete `MemoryResponse` interface from `src/types/api.ts`
- [x] Delete `api.getMemory()` method from `src/services/api.ts`
- [x] Delete `useMemoryQuery()` hook from `src/cores/api-queries/queries.ts`
- [x] Remove `useMemoryQuery` export from `src/cores/api-queries/index.ts`

## 3. Update useConfig hook

- [x] Add default values for new memory fields in `src/cores/hooks/useConfig.ts`

## 4. Update MaxMemoryScaleFactorPreview

- [x] Replace `useMemoryQuery()` with `useConfig()` in `MaxMemoryScaleFactorPreview.tsx`
- [x] Update memory display to use `total_gpu_memory` and `total_ram_memory`

## 5. Update tests

- [x] Update `src/cores/api-queries/__tests__/queries.test.ts` - remove memory query tests
- [x] Update `src/services/__tests__/api.test.ts` - remove getMemory tests
- [x] Update `src/cores/hooks/__tests__/useConfig.test.ts` - add tests for new fields
- [x] Update `src/features/max-memory-scale-factor/presentations/__tests__/MaxMemoryScaleFactorPreview.test.tsx`

## 6. Verify

- [x] Run type-check: `pnpm run type-check`
- [x] Run tests: `pnpm test`
- [x] Run lint: `pnpm run lint`
