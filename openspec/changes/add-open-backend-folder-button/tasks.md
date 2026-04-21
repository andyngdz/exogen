## 1. Electron IPC Setup

- [x] 1.1 Add `openBackendFolder` method type to `ElectronAPI.backend` in `types/electron.ts`
- [x] 1.2 Add IPC handler in `electron/main.ts` that opens `{userData}/BACKEND_DIRNAME` using `shell.openPath()` (reuse `BACKEND_DIRNAME` from `scripts/backend/constants.ts`)
- [x] 1.3 Expose `openBackendFolder` method in `electron/preload.ts`

## 2. Frontend Integration

- [x] 2.1 Create `useBackendFolder` hook in `states/useBackendFolder.ts` with `onOpenBackendFolder` function
- [x] 2.2 Add IconButton with folder icon next to "Backend Logs" title in `BackendLog.tsx`
- [x] 2.3 Connect IconButton to `onOpenBackendFolder` from the hook

## 3. Testing

- [x] 3.1 Add unit test for `useBackendFolder` hook
- [x] 3.2 Add unit test for the IconButton in `BackendLog.test.tsx`
- [x] 3.3 Update vitest.setup.ts mock for new electronAPI method

## 4. Verification

- [x] 4.1 Manual test: Click button opens correct folder on current OS
