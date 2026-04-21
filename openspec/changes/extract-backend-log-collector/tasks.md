## 1. Implementation

- [x] 1.1 Create `useBackendLogCollector.ts` hook with log subscription logic extracted from `useBackendLog`
- [x] 1.2 Create `BackendLogCollector.tsx` wrapper component following the `DownloadWatcher` pattern
- [x] 1.3 Refactor `useBackendLog.ts` to remove log collection logic, keeping only UI concerns (virtualizer, scroll)
- [x] 1.4 Update `src/features/backend-logs/states/index.ts` to export the new hook
- [x] 1.5 Update `src/features/backend-logs/index.ts` to export the new collector component
- [x] 1.6 Mount `BackendLogCollector` in `src/app/providers.tsx` at the app root

## 2. Testing

- [x] 2.1 Add unit tests for `useBackendLogCollector` hook
- [x] 2.2 Add unit tests for `BackendLogCollector` component
- [x] 2.3 Update existing `useBackendLog` tests to reflect removed responsibilities
- [x] 2.4 Verify all existing tests pass

## 3. Validation

- [x] 3.1 Run type-check to ensure no TypeScript errors
- [x] 3.2 Run lint to ensure code style compliance
- [ ] 3.3 Manual test: Verify logs are captured from app startup before opening console drawer
