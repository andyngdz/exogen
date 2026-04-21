# Change: Integrate Safety Check API

## Why

The backend now exposes a `safety_check_enabled` configuration via `GET /config/` and `PUT /config/safety-check`. Currently, the frontend has a `safetyCheck` setting persisted only locally in Zustand. This change syncs the setting with the backend so the safety checker respects the user's preference during image generation.

## What Changes

- Rename `safetyCheck` to `safety_check_enabled` in frontend to match backend naming
- Add `safety_check_enabled: boolean` field to `BackendConfig` type
- Add API method `setSafetyCheckEnabled(enabled: boolean)` in `src/services/api.ts`
- Add `useSafetyCheckMutation` hook to sync setting changes to backend
- Update `useGeneralSettings` to sync with backend on setting change
- Update `useConfig()` to expose `safety_check_enabled` with default `true`

## Impact

- Affected specs: `backend-config`
- Affected code:
  - `src/types/api.ts` - Add `safety_check_enabled` to `BackendConfig`
  - `src/services/api.ts` - Add `setSafetyCheckEnabled()` method
  - `src/cores/api-queries/queries.ts` - Add `useSafetyCheckMutation` hook
  - `src/cores/hooks/useConfig.ts` - Expose `safety_check_enabled` with default
  - `src/features/settings/types/settings.ts` - Rename `safetyCheck` to `safety_check_enabled`
  - `src/features/settings/states/useSettingsStore.ts` - Update field name
  - `src/features/settings/states/useGeneralSettings.ts` - Call mutation on change
  - `src/features/settings/presentations/tabs/GeneralSettings.tsx` - Update register field name
  - Tests for all affected files
