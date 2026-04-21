# Change: Add Open Backend Folder Button

## Why

Users may need to access the backend folder to inspect logs, configuration files, or troubleshoot issues. Currently, there's no easy way to navigate to this folder from within the app - users must manually find the path in their file system.

## What Changes

- Add an IconButton next to the "Backend Logs" title in the drawer header
- Add a new Electron IPC method to open the backend folder in the system file explorer
- The button opens `{userData}/exogen_backend` folder using the system's default file manager

## Impact

- Affected specs: `log-streaming`
- Affected code:
  - `electron/main.ts` - New IPC handler for opening folder
  - `electron/preload.ts` - Expose new method to renderer
  - `types/electron.ts` - Add type definition
  - `src/features/backend-logs/presentations/BackendLog.tsx` - Add IconButton to drawer header
