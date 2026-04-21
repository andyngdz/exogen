## 1. Core Hook Updates

- [x] 1.1 Add `isLoading` to `useConfig` hook return type and implementation
- [x] 1.2 Add `isHasDevice` derived value to `useConfig` hook

## 2. Health Check Refactor

- [x] 2.1 Create `useHealthCheck` hook in `src/features/health-check/states/`
- [x] 2.2 Move routing logic from `HealthCheck` component to `useHealthCheck` hook
- [x] 2.3 Update `HealthCheck` component to use `useHealthCheck` hook
- [x] 2.4 Export `useHealthCheck` from feature index

## 3. Testing

- [x] 3.1 Update `useConfig` tests to cover `isLoading` state
- [x] 3.2 Update `useConfig` tests to cover `isHasDevice` value
- [x] 3.3 Create tests for `useHealthCheck` hook
- [x] 3.4 Update `HealthCheck` component tests for new behavior
- [x] 3.5 Add test: "does not redirect while config is loading"

## 4. Validation

- [x] 4.1 Run all tests and verify no regressions
- [x] 4.2 Manual test: fresh install shows setup flow correctly
- [x] 4.3 Manual test: subsequent app restarts go directly to editor
