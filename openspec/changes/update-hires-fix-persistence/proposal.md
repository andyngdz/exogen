# Change: Preserve Hires Fix values across toggles

## Why

Unchecking Hires Fix currently unregisters `hires_fix`, wiping stored values and forcing defaults to reapply on the next enable. Users lose their adjustments and reconfiguration is required after every toggle.

## What Changes

- Keep `hires_fix` values persisted when toggling Hires Fix off/on (stop unregister/removal of the config object).
- Introduce an explicit enable flag (e.g., `isHiresFixEnabled`) tracked outside the `hires_fix` form data (UI toggle/request metadata), used solely to decide if `hires_fix` is sent.
- Ensure backend payload omits `hires_fix` when the flag is false while preserving stored values locally.
- Update tests/specs to cover persistence, enable flag behavior, flag location, and payload omission.

## Impact

- Affected specs: `generator-defaults` (behavior update), possibly `backend-config` if payload semantics are codified there.
- Affected code: generator UI toggle state/request builders (flag), generator config store for `hires_fix` values, related tests.
- User impact: User-set Hires Fix values persist across toggles; disabling prevents sending hires_fix to backend without data loss; enable flag lives outside the config payload.
