## 1. Implementation

- [x] 1.1 Revert `get_device_index()` in `config_crud.py` to return raw value (remove validation/fallback logic)
- [x] 1.2 Remove `get_raw_device_index()` function from `config_crud.py`
- [x] 1.3 Update `MemoryService` to check `device_index < 0` before calling `torch.cuda.get_device_properties()`

## 2. Testing

- [x] 2.1 Update tests for `get_device_index()` to reflect new behavior
- [x] 2.2 Add tests for `MemoryService` handling negative device index
- [x] 2.3 Run full test suite to verify no regressions
