# Tasks

## 1. Database Layer

- [x] 1.1 Add `safety_check_enabled: bool` column to `Config` model in `app/database/models/config.py` with `server_default=true()`
- [x] 1.2 Add `DEFAULT_SAFETY_CHECK_ENABLED = True` constant to `app/database/constant.py`
- [x] 1.3 Create Alembic migration for the new column
- [x] 1.4 Add `get_safety_check_enabled(db)` function to `app/database/config_crud.py`
- [x] 1.5 Add `set_safety_check_enabled(db, enabled)` function to `app/database/config_crud.py`

## 2. Config API

- [x] 2.1 Add `safety_check_enabled: bool` field to `ConfigResponse` in `app/schemas/config.py`
- [x] 2.2 Update `GET /config` endpoint to include `safety_check_enabled` from database
- [x] 2.3 Add `PUT /config/safety-check` endpoint with `SafetyCheckRequest` schema
- [x] 2.4 Update `config-api` spec with new requirements

## 3. Generation Integration

- [x] 3.1 Modify `run_safety_checker()` in `app/cores/generation/latent_decoder.py` to accept `enabled` parameter
- [x] 3.2 Update `base_generator.py` to read setting from database and pass to `run_safety_checker()`
- [x] 3.3 When disabled, skip safety check and return `(images, [False] * len(images))`

## 4. Testing

- [x] 4.1 Add tests for new CRUD functions in `tests/app/database/test_config_crud.py`
- [x] 4.2 Add tests for updated config API endpoints
- [x] 4.3 Update `test_latent_decoder.py` tests for `enabled` parameter
- [x] 4.4 Update `test_base_generator.py` to mock the setting
