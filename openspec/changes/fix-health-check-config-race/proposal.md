# Change: Fix Health Check Config Race Condition

## Why

After an auto-update, the app incorrectly shows the GPU/RAM setup wizard again, even though the user has already configured these settings. This happens because the health check routing decision is made before the backend config query completes loading, causing `device_index` to use its default value (`NOT_FOUND`), which triggers the setup flow.

## What Changes

- Add `isLoading` state to `useConfig` hook to expose query loading status
- Add `isHasDevice` derived value to `useConfig` hook to encapsulate device check logic
- Update `HealthCheck` component to wait for config to load before making routing decision
- Extract `HealthCheck` logic into a new `useHealthCheck` hook for better separation of concerns and testability

## Impact

- Affected specs: `backend-config` (adding loading state requirement), new `health-check` spec
- Affected code:
  - `src/cores/hooks/useConfig.ts`
  - `src/features/health-check/presentations/HealthCheck.tsx`
  - `src/features/health-check/states/useHealthCheck.ts` (new)
