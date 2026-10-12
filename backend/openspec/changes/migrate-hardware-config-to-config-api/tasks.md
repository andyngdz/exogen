## 1. Schema Updates

- [x] 1.1 Add `device_index: int` field to `ConfigResponse` in `app/schemas/config.py`
- [x] 1.2 Add `DeviceRequest` schema (device_index) to `app/schemas/config.py`
- [x] 1.3 Add `MaxMemoryRequest` schema (gpu_scale_factor, ram_scale_factor) to `app/schemas/config.py`

## 2. Service Updates

- [x] 2.1 Update `ConfigService.get_config()` to fetch and return device_index via `config_crud.get_device_index()`
- [x] 2.2 Add `set_device()` method to `ConfigService`
- [x] 2.3 Add `set_max_memory()` method to `ConfigService`

## 3. Config API Updates

- [x] 3.1 Add `PUT /config/device` endpoint to `app/features/config/api.py`
- [x] 3.2 Add `PUT /config/max-memory` endpoint to `app/features/config/api.py`

## 4. Hardware API Cleanup

- [x] 4.1 Remove `GET /hardware/device` endpoint
- [x] 4.2 Remove `POST /hardware/device` endpoint
- [x] 4.3 Remove `POST /hardware/max-memory` endpoint
- [x] 4.4 Remove `get_device()` and `set_device()` from `HardwareService`
- [x] 4.5 Remove `set_max_memory()` from `HardwareService`

## 5. Schema Cleanup

- [x] 5.1 Remove `GetCurrentDeviceIndex` from `app/schemas/hardware.py`
- [x] 5.2 Remove `SelectDeviceRequest` from `app/schemas/hardware.py`
- [x] 5.3 Remove `MaxMemoryConfigRequest` from `app/schemas/hardware.py`

## 6. Testing

- [x] 6.1 Add tests for device_index in config response
- [x] 6.2 Add tests for `PUT /config/device`
- [x] 6.3 Add tests for `PUT /config/max-memory`
- [x] 6.4 Remove hardware device/max-memory tests
- [x] 6.5 Run all tests to verify no regressions
