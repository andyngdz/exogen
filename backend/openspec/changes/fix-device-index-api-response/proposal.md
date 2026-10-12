# Change: Fix device index API response to return -2 when not configured

## Why

The Frontend needs `device_index: -2` to detect when no device has been selected and show the device picker UI. The previous fix (`fix-invalid-device-index-handling`) prevented crashes by falling back to `0`, but this broke the Frontend's ability to detect the "not configured" state.

## What Changes

- Simplify `get_device_index()` in `config_crud.py` to return the raw value without validation/fallback
- Move the invalid device handling to `MemoryService` - check if `device_index < 0` and return `total_gpu = 0` instead of calling `torch.cuda.get_device_properties()` with an invalid index
- Remove the `get_raw_device_index()` function (was added but not needed with this approach)

## Impact

- Affected specs: config-api (device index validation behavior)
- Affected code: `app/database/config_crud.py`, `app/services/memory.py`
