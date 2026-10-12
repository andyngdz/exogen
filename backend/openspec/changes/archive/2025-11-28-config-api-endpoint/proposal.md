# Change: Config API Endpoint

## Why
Frontend needed configuration data (upscaler options, etc.) without hardcoding values.

## What Changes
- Added GET /config endpoint
- Returns upscaler metadata with value, name, description, suggested_denoise_strength
- Extensible schema for future config items

## Impact
- Affected code: `app/features/config/`, `app/schemas/config.py`
- New entities: UpscalerItem, ConfigResponse
