# Change: Add GPU/RAM Scale Factors to Config Endpoint

## Why

The frontend needs GPU and RAM scale factors to display current memory configuration settings. These values already exist in the database but are only accessible via the `/hardware/memory` endpoint, requiring an extra API call.

## What Changes

- Add `gpu_scale_factor` and `ram_scale_factor` fields to `/config` endpoint response
- Read-only access (updates remain at `/hardware/max-memory`)

## Impact

- Affected specs: config-api
- Affected code: `app/schemas/config.py`, `app/features/config/api.py`
