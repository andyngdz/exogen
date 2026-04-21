# Tasks

## Backend Message Change

1. [x] Update status message in `scripts/backend/run-backend.ts:64` from `'ExoGen Backend started successfully'` to `'ExoGen Backend is starting'`
2. [x] Update test expectations in `scripts/backend/__tests__/run-backend.test.ts` to match new message

## UI Spinner Addition

3. [x] Add `isLast` prop to `BackendStatusItem` component interface
4. [x] Add `Spinner` component from HeroUI to `BackendStatusItem.tsx` - show only when `isLast` is true AND level is not error
5. [x] Update `BackendStatusList.tsx` to pass `isLast={index === statuses.length - 1}` to each `BackendStatusItem`
6. [x] Update `BackendStatusItem.test.tsx` to verify:
   - Spinner renders when `isLast=true` and level is info
   - No spinner when `isLast=false` (previous messages)
   - No spinner when `isLast=true` but level is error
7. [x] Update `BackendStatusList.test.tsx` to verify `isLast` prop is passed correctly

## Verification

8. [x] Run `pnpm test -- scripts/backend/__tests__/run-backend.test.ts` to verify backend tests pass
9. [x] Run `pnpm test -- src/features/health-check/presentations/__tests__/BackendStatusItem.test.tsx src/features/health-check/presentations/__tests__/BackendStatusList.test.tsx` to verify UI tests pass
10. [x] Run `pnpm run type-check` to verify no type errors
