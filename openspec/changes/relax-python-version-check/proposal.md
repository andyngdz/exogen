# Relax Python Version Check

## Summary

Change the Python version detection to accept Python 3.11+ instead of requiring exactly 3.11. Show a warning for versions newer than 3.11 (e.g., 3.12, 3.13) indicating they may not be fully tested, but allow the backend to proceed.

## Motivation

The backend's `pyproject.toml` specifies `requires-python = ">=3.11"`, meaning any Python 3.11+ should work. The current frontend check is overly strict, rejecting valid Python versions like 3.12 and 3.13 that users commonly have installed.

This causes friction for users who have newer Python versions, forcing them to install an older version when their current one would likely work fine.

## Behavior Changes

| Scenario               | Current                     | Proposed                   |
| ---------------------- | --------------------------- | -------------------------- |
| Python 3.11.x          | ✅ Proceed                  | ✅ Proceed                 |
| Python 3.12.x          | ❌ Error, must install 3.11 | ⚠️ Warning, proceed anyway |
| Python 3.13.x          | ❌ Error, must install 3.11 | ⚠️ Warning, proceed anyway |
| Python 3.10.x or lower | ❌ Error                    | ❌ Error (unchanged)       |
| No Python              | ❌ Error                    | ❌ Error (unchanged)       |

## Scope

- `scripts/backend/ensure-python.ts` - Modify version check logic
- `scripts/backend/__tests__/ensure-python.test.ts` - Update test expectations

## Risks

- **Low risk**: If a newer Python version is truly incompatible, the backend will fail with a more specific error during dependency installation or runtime
- Users are warned that newer versions may have issues
