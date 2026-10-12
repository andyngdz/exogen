## 1. Schema Updates

- [x] 1.1 Add `total_gpu_memory` field (int, bytes) to `ConfigResponse` in `app/schemas/config.py`
- [x] 1.2 Add `total_ram_memory` field (int, bytes) to `ConfigResponse` in `app/schemas/config.py`

## 2. Config API Updates

- [x] 2.1 Update `get_config()` to fetch and return `total_gpu_memory`
- [x] 2.2 Update `get_config()` to fetch and return `total_ram_memory`
- [x] 2.3 Update `update_safety_check()` to include memory info in response

## 3. Hardware API Cleanup

- [x] 3.1 Remove `GET /hardware/memory` endpoint from `app/features/hardware/api.py`
- [x] 3.2 Remove `get_memory_info()` from `HardwareService` if no longer needed
- [x] 3.3 Remove `MemoryResponse` from `app/schemas/hardware.py` if no longer needed

## 4. Testing

- [x] 4.1 Add tests for `/config` returning `total_gpu_memory` and `total_ram_memory`
- [x] 4.2 Remove tests for `/hardware/memory` endpoint
- [x] 4.3 Update existing config API tests to include memory fields in mocks
