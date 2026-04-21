# Change: Auto-Update

## Why

Users need automatic update detection, download, and installation to stay up-to-date without manually checking.

## What Changes

- Add electron-updater integration for auto-update
- Implement update notification UI
- Support Windows (NSIS), macOS (DMG), and Linux (AppImage)
- Add manual "Check for Updates" option in settings

## Impact

- Affected specs: auto-update
- Affected code: Electron main process, update notification components
