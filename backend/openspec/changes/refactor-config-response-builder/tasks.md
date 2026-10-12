## 1. Service Update

- [x] 1.1 Add `get_config(db: Session) -> ConfigResponse` method to `ConfigService`
- [x] 1.2 Move response building logic from `api.py` to the new method

## 2. API Update

- [x] 2.1 Update `get_config()` endpoint to call `config_service.get_config(db)`
- [x] 2.2 Update `update_safety_check()` endpoint to call `config_service.get_config(db)`
- [x] 2.3 Remove duplicate imports no longer needed in `api.py`

## 3. Testing

- [x] 3.1 Update tests to mock `config_service.get_config()` instead of individual components
- [x] 3.2 Run existing tests to verify no behavior change
