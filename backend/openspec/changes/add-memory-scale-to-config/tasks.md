## 1. Schema Updates

- [x] 1.1 Add `gpu_scale_factor` field to `ConfigResponse` in `app/schemas/config.py`
- [x] 1.2 Add `ram_scale_factor` field to `ConfigResponse` in `app/schemas/config.py`

## 2. API Updates

- [x] 2.1 Update `get_config()` to fetch and return `gpu_scale_factor` from database
- [x] 2.2 Update `get_config()` to fetch and return `ram_scale_factor` from database
- [x] 2.3 Update `update_safety_check()` to include scale factors in response

## 3. Testing

- [x] 3.1 Add test for `/config` returning default scale factors (0.5)
- [x] 3.2 Add test for `/config` returning custom scale factors after `/hardware/max-memory` update
