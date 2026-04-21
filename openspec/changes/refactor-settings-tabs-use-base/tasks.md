## 1. Implementation

- [x] 1.1 Refactor `GeneralSettings` to use `SettingsBase` with title "General" and description "Configure general application settings"
- [x] 1.2 Refactor `SettingsMemoryConfig` to use `SettingsBase` instead of duplicating its markup
- [x] 1.3 Refactor `MemorySettings` - no change needed since it renders `SettingsMemoryConfig` which now uses `SettingsBase`
- [x] 1.4 Refactor `ModelManagement` to use `SettingsBase` with title "Model Management" and description "Manage your installed AI models"
- [x] 1.5 Refactor `UpdateSettings` to use `SettingsBase` with title "Updates" and description "Check for application updates"
- [x] 1.6 Update tests to verify `SettingsBase` is rendered with correct title/description
- [x] 1.7 Run all tests and lint to verify no regressions
