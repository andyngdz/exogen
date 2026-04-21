# Tasks

## Implementation

1. [x] Modify `tryCandidate` in `ensure-python.ts` to accept Python 3.11+ (not just 3.11.x)
2. [x] Add warning emission in `ensurePython311` when detected version is > 3.11 (e.g., 3.12, 3.13)
3. [x] Update warning message to indicate the version may not be fully tested

## Testing

4. [x] Update tests to verify Python 3.11.x proceeds without warning
5. [x] Add test for Python 3.12.x - should proceed with warning
6. [x] Add test for Python 3.13.x - should proceed with warning
7. [x] Verify Python 3.10.x still fails with error
8. [x] Fix start-backend.test.ts to include `minor` field in mock

## Verification

9. [x] Run `pnpm test -- scripts/backend/__tests__/ensure-python.test.ts`
10. [x] Run `pnpm run type-check`
