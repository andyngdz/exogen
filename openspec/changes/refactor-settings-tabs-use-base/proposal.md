# Change: Refactor Settings Tabs to Use SettingsBase

## Why

Settings tab components duplicate title/description/divider markup. The `SettingsBase` component exists but is unused. Using it provides consistent layout and reduces code duplication.

## What Changes

- Refactor `GeneralSettings` to wrap content in `SettingsBase` with title and description
- Refactor `MemorySettings` to wrap content in `SettingsBase` with title and description
- Refactor `ModelManagement` to wrap content in `SettingsBase` with title and description
- Refactor `UpdateSettings` to wrap content in `SettingsBase` with title and description
- Refactor `SettingsMemoryConfig` to use `SettingsBase` instead of duplicating its markup
- Update tests to reflect the new structure

## Impact

- Affected specs: None (internal refactoring only, no behavior changes)
- Affected code:
  - `src/features/settings/presentations/tabs/GeneralSettings.tsx`
  - `src/features/settings/presentations/tabs/MemorySettings.tsx`
  - `src/features/settings/presentations/tabs/ModelManagement.tsx`
  - `src/features/settings/presentations/tabs/UpdateSettings.tsx`
  - `src/features/settings/presentations/SettingsMemoryConfig.tsx`
  - Related test files

## Notes

This is a refactoring-only change with no spec deltas. Archive with `openspec archive refactor-settings-tabs-use-base --skip-specs --yes` after implementation.
