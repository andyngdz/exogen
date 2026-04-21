# Change: Fix backend log auto-scroll on modal open

## Why

When opening the backend logs drawer, the log list sometimes does not scroll to the end. This occurs because the current implementation uses `scrollTo()` with `scrollHeight` before the virtualizer has finished measuring elements, causing the scroll position to be calculated incorrectly.

## What Changes

- Replace manual `scrollTo()` with virtualizer's `scrollToIndex()` API
- Use a descriptive variable for the scroll target index
- Update tests to verify the new scrolling behavior

## Impact

- Affected specs: `log-streaming`
- Affected code: `src/features/backend-logs/states/useBackendLog.ts`
