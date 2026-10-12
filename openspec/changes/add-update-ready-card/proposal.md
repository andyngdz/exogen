# Change: Show a downloaded update inside the app

## Why

A downloaded update pops a native dialog over whatever the user is doing, and Settings > Updates shows only the version and a Check button. Frame 3n of the redesign moves the "ready to install" state into the Updates section and flags it with a dot, so the user installs when it suits them.

## What Changes

- The main process keeps the updater state (downloaded version, last check time) and broadcasts it on `updater:state`; the renderer reads it with `updater:get-state` on mount.
- The native "Update Ready" dialog goes away.
- Settings > Updates shows a "ready to install" card with Later and Install and restart, plus a "Last checked" line next to Check for updates.
- A dot flags a pending update on the Settings rail icon and on the Updates nav item.
- Later hides the card and both dots for the rest of the session; electron-updater still installs on quit.

## Impact

- Affected specs: `auto-update`
- Affected code:
  - `electron/updater.ts`, `electron/main.ts`, `electron/preload.ts`
  - `types/update.ts`, `types/electron.ts`, `vitest.setup.ts`
  - `src/features/settings/states/` (updater store, state watcher, `useUpdaterSettings`)
  - `src/features/settings/presentations/` (`UpdateSettings`, `SettingsNavTab`, `SettingsView`)
  - `src/features/app-shell/` (rail dot, watcher mount)
