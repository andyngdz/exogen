## 1. Implementation

- [x] 1.1 Add device index validation in `get_device_index` function in `config_crud.py`
- [x] 1.2 Add warning log for invalid device index fallback in `config_crud.py`
- [x] 1.3 Remove validation and logging from `MemoryService.__init__`

## 2. Verification

- [x] 2.1 Test first-time setup (no config in database)
- [x] 2.2 Test with valid device index
- [x] 2.3 Update existing tests for `get_device_index` if needed
