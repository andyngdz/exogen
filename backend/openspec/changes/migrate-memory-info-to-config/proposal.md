# Change: Migrate Memory Info to Config Endpoint

## Why

The frontend needs total GPU/RAM memory alongside scale factors to display memory configuration. Currently this requires two API calls (`/config` + `/hardware/memory`). Consolidating into `/config` simplifies the frontend and provides all memory-related settings in one response.

## What Changes

- **BREAKING**: Remove `GET /hardware/memory` endpoint
- Add `total_gpu_memory` (bytes) to `/config` response
- Add `total_ram_memory` (bytes) to `/config` response

## Impact

- Affected specs: config-api
- Affected code:
  - `app/schemas/config.py` - Add new fields
  - `app/features/config/api.py` - Fetch and return memory info
  - `app/features/hardware/api.py` - Remove `/memory` endpoint
  - `app/schemas/hardware.py` - Remove `MemoryResponse` (if unused elsewhere)
  - `app/features/hardware/service.py` - `get_memory_info()` may be relocated or removed
