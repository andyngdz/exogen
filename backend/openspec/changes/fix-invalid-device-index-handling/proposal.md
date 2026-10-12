# Change: Fix invalid device index handling on first setup

## Why

When the application starts for the first time, there is no `device_index` in the database. The `get_device_index()` function returns `DeviceSelection.NOT_FOUND` (-2), which causes `torch.cuda.get_device_properties(-2)` to throw `AssertionError: Invalid device id`, crashing the application on the `/config/` endpoint.

## What Changes

- Improve `get_device_index` in `config_crud.py` to validate the device index and return a safe fallback
- Check against `DeviceSelection.NOT_FOUND` or when index exceeds `device_service.device_count`
- Fall back to `device_service.current_device` when invalid
- Log a warning in `get_device_index` when falling back
- Keep `MemoryService` clean - it just returns memory values without logging

## Impact

- Affected specs: config-api (device configuration behavior)
- Affected code: `app/database/config_crud.py`, `app/services/memory.py`
