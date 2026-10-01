## 1. Main process

- [x] 1.1 Add `UpdaterState` to `types/update.ts` and `updater.onState` to `types/electron.ts`
- [x] 1.2 Track downloaded version and last check time in `electron/updater.ts`, broadcast `updater:state`, drop the native dialog
- [x] 1.3 Handle `updater:get-state` in `electron/main.ts`; expose `updater.onState` in `electron/preload.ts`

## 2. Renderer

- [x] 2.1 Add `useUpdaterStore` (not persisted) with `UPDATER_ACTIONS` and `useHasPendingUpdate`
- [x] 2.2 Add `useUpdateStateWatcher` and mount it from the app shell
- [x] 2.3 Show the ready card and the "Last checked" line in `UpdateSettings`
- [x] 2.4 Show the dot on the Settings rail icon and the Updates nav item

## 3. Testing

- [x] 3.1 Store, watcher, and `useUpdaterSettings` unit tests
- [x] 3.2 `UpdateSettings`, `SettingsNavTab`, and `AppRail` render tests for the card and dots
- [x] 3.3 Mock `updater.onState` in `vitest.setup.ts`

## 4. Verification

- [x] 4.1 Screenshot Settings > Updates and the rail with a pending update against frame 3n
