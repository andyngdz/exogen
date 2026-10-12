# Change: Model Manager Refactor

## Why
Race conditions and resource leaks in model loading caused unpredictable behavior and memory issues.

## What Changes
- Implemented state machine for model transitions (IDLE → LOADING → LOADED → UNLOADING)
- Added proper GPU/MPS resource cleanup on unload
- Introduced cancellation handling without resource leaks
- Converted to property-based API for cleaner state access
- Reduced ModelManager from 485 to 162 lines (66% reduction)

## Impact
- Affected code: `app/cores/model_manager/`
- Fixed 7 bugs (2 critical, 2 major, 3 minor)
