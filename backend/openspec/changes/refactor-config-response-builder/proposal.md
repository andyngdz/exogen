# Change: Refactor Config Response Builder

## Why

The `GET /config` and `PUT /config/safety-check` endpoints both construct identical `ConfigResponse` objects (lines 18-25 and 34-41 in `api.py`). This violates DRY and makes maintenance harder.

## What Changes

- Extract response building into `config_service.get_config(db)` method
- Both endpoints call the service method instead of duplicating code
- No API behavior change (pure refactoring)

## Impact

- Affected specs: None (internal refactoring only)
- Affected code: `app/features/config/api.py`, `app/features/config/service.py`
