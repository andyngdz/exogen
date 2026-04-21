# Change: Extract backend log collector to run at app root

## Why

Currently, `useBackendLog` runs inside `BackendLogList.tsx` which is rendered within a modal (Drawer). This means log collection only starts when the user opens the console drawer - any logs emitted before that are lost. Users need to see all backend logs from application startup, not just from when they open the console.

## What Changes

- Extract log collection logic from `useBackendLog` into a new `useBackendLogCollector` hook
- Create a `BackendLogCollector` wrapper component (similar to `DownloadWatcher` pattern)
- Mount `BackendLogCollector` at the app root level in `providers.tsx`
- Refactor `useBackendLog` to only handle UI concerns (virtualizer, scroll behavior)

## Impact

- Affected specs: `log-streaming`
- Affected code:
  - `src/features/backend-logs/states/useBackendLog.ts` - Remove log collection, keep UI logic
  - `src/features/backend-logs/states/useBackendLogCollector.ts` - New hook for log collection
  - `src/features/backend-logs/presentations/BackendLogCollector.tsx` - New wrapper component
  - `src/app/providers.tsx` - Mount the collector component
