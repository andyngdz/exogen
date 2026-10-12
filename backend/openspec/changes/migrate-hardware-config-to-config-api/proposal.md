# Migrate Hardware Config Endpoints to Config API

## Problem

The `/hardware` API mixes two concerns:
1. **Hardware detection** (read-only): GPU info, driver status
2. **Configuration** (read/write): device selection, memory limits

This is inconsistent - memory scale factors are readable from `GET /config` but writable via `POST /hardware/max-memory`.

## Solution

Migrate all config-related endpoints from `/hardware` to `/config`:

| Current | New | Notes |
|---------|-----|-------|
| `GET /hardware/device` | `GET /config` (device_index field) | Add to ConfigResponse |
| `POST /hardware/device` | `PUT /config/device` | Move endpoint |
| `POST /hardware/max-memory` | `PUT /config/max-memory` | Move endpoint |

After migration, `/hardware` becomes read-only:
- `GET /hardware/` - GPU info
- `GET /hardware/recheck` - Force re-detect

## Breaking Changes

- `GET /hardware/device` removed → read from `GET /config` response
- `POST /hardware/device` removed → use `PUT /config/device`
- `POST /hardware/max-memory` removed → use `PUT /config/max-memory`

## Benefits

- Clear separation: `/hardware` = detection, `/config` = settings
- All config in one place for frontend
- Consistent API design (PUT for updates, not POST)
