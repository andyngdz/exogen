# Change: Backend Configuration Store

## Why

Dynamic options like upscalers should be fetched from the backend rather than hardcoded, allowing backend-controlled settings without frontend code changes.

## What Changes

- Fetch configuration from `/config/` endpoint on app startup
- Store configuration in centralized Zustand store
- Make upscaler options available with all metadata
- Use backend config as first-time defaults only
- Preserve user-modified values across restarts
- Provide null-safe `useConfig()` hook

## Impact

- Affected specs: backend-config
- Affected code: Config store, useConfig hook, Hires.fix upscaler component
