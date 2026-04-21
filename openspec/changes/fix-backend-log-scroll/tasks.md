## 1. Implementation

- [x] 1.1 Update `useBackendLog.ts` to use `scrollToIndex()` instead of manual `scrollTo()`
- [x] 1.2 Extract scroll target index to a descriptive variable (`lastLogIndex`)
- [x] 1.3 Update unit tests to verify `scrollToIndex` is called with correct parameters

## 2. Validation

- [x] 2.1 Run unit tests: `pnpm test -- src/features/backend-logs`
- [x] 2.2 Run type check: `pnpm run type-check`
- [ ] 2.3 Manual verification: Open backend logs drawer and confirm scroll to bottom works reliably
