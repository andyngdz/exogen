# Change: Fix Test Runner Warnings

## Why

`pnpm test` currently emits numerous warnings (React `act()` notices, console errors from mocked update checks, and HeroUI/Select DOM warnings). These noisy logs hide real regressions and mask accessibility issues. We need a consistent plan to eliminate the warnings and prevent regressions.

## What Changes

- Audit Vitest warnings and categorize them by source (React act, noisy console errors, invalid DOM structure, HeroUI prop misuse)
- Update affected test suites to use proper React Testing Library patterns (wrap state updates in `act`, stabilize form interactions, mock network errors without console noise)
- Adjust HeroUI select usage so rendered DOM is valid (avoid `<span>` inside `<option>`, set explicit `value` props)
- Add lint/test guardrails to catch warnings locally (Vitest `--runInBand`? or custom reporter) **(non-breaking)**

## Impact

- Affected specs: release, log-streaming (test quality + pipeline predictability)
- Affected code: multiple test files under `src/features/*/__tests__` plus shared UI components (HeroUI `Select` usage), test utilities, Vitest config
