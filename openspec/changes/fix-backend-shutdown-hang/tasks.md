## 1. Dependencies

- [x] 1.1 Replace `fkill` with `tree-kill` package (fkill is ESM-only, incompatible with Electron's CommonJS build)

## 2. Implementation

- [x] 2.1 Update `stopBackend` to be async and use `tree-kill`
- [x] 2.2 Update `electron/main.ts` to handle async `stopBackend` in `before-quit`
- [x] 2.3 Update `runBackend` to await `stopBackend` call
- [x] 2.4 Refactor `electron/main.ts` to use `main()` pattern for async/await with CommonJS
- [x] 2.5 Add `--success first` to devall concurrently to avoid red error on clean exit

## 3. Testing

- [x] 3.1 Update existing `stopBackend` tests to be async
- [x] 3.2 Add test for `tree-kill` being called with correct arguments
- [x] 3.3 Add test for error handling when `tree-kill` fails

## 4. Integration Testing

- [x] 4.1 Manual test on Windows: Run `pnpm run desktop`, close app, verify terminal returns to prompt
- [x] 4.2 Manual test on Linux (macOS skipped - low priority)
- [x] 4.3 Verify no orphaned Python processes remain after app shutdown
