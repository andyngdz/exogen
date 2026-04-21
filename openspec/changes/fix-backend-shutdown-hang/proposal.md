# Change: Fix Backend Shutdown Hang on Windows

**Status: Complete**

## Why

When running `pnpm run desktop` and closing the app, the process hangs indefinitely after logging `App is quitting, stopping backend...`. The terminal never returns to the prompt because the Python backend process is not being terminated properly on Windows.

The root cause is that `SIGTERM` does not work reliably on Windows, and the `uv run uvicorn` command spawns child processes that may not be killed when the parent process receives a termination signal.

## What Changes

- Add `tree-kill` package for cross-platform process tree termination (CommonJS compatible)
- Update `stopBackend` to use `tree-kill` to kill entire process tree
- Make `stopBackend` async to properly await process termination
- Refactor `electron/main.ts` to use `main()` pattern for async/await with CommonJS
- Handle all platforms (Windows, Linux, macOS) consistently

## Impact

- Affected specs: None existing (new `backend-lifecycle` capability)
- Affected code:
  - `package.json` - Add `tree-kill` dependency
  - `scripts/backend/run-backend.ts` - Update `stopBackend` to use `tree-kill`
  - `scripts/backend/__tests__/run-backend.test.ts` - Update tests for async behavior
  - `electron/main.ts` - Update `before-quit` handler for async `stopBackend`
  - `scripts/devall.ts` - Add `--success first` to concurrently
