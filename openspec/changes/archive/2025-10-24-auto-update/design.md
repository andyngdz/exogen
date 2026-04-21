# Auto-Update Implementation Guide

## Overview

Auto-update functionality has been successfully implemented for the ExoGen Electron app using `electron-updater` and GitHub Releases as the distribution channel.

## What Was Implemented

### 1. Dependencies Added

- **electron-updater**: Handles the auto-update logic
- **electron-log**: Provides logging for the updater

### 2. Files Created/Modified

#### New Files:

- `electron/updater.ts`: Core auto-update logic with event handlers
- `build/entitlements.mac.plist`: macOS code signing entitlements
- `.github/workflows/build-app.yml`: CI workflow for building and publishing releases

#### Modified Files:

- `electron-builder.yaml`: Added publish configuration for GitHub releases
- `electron/main.ts`: Integrated updater initialization and IPC handlers
- `electron/preload.ts`: Exposed updater API to renderer process
- `types/electron.ts`: Added TypeScript types for updater API

## How It Works

### Update Flow:

1. **On App Start**: After the main window is ready, the app checks for updates (5-second delay)
2. **Update Available**: Users are notified through the renderer process
3. **Download**: Update is downloaded in the background with progress tracking
4. **Install**: User is prompted to restart and install the update

### API Available to Renderer:

```typescript
window.electronAPI.updater.checkForUpdates() // Manually check for updates
window.electronAPI.updater.downloadUpdate() // Download available update
window.electronAPI.updater.installUpdate() // Install downloaded update
window.electronAPI.updater.getUpdateInfo() // Get current update status
window.electronAPI.updater.onUpdateStatus(cb) // Listen to update events
```

## Configuration

### electron-builder.yaml

The publish configuration points to your GitHub repository:

```yaml
publish:
  provider: 'github'
  owner: 'andyngdz'
  repo: 'exogen'
  releaseType: 'release'
```

### Platform Builds:

- **Windows**: NSIS installer, portable .exe, zip
- **macOS**: DMG, zip (with code signing support)
- **Linux**: AppImage, deb, zip

## How to Use

### Creating a Release:

1. Merge your code to the `release` branch
2. The CI workflow will automatically:
   - Build the app for Windows, macOS, and Linux
   - Create a GitHub Release with all artifacts
   - Generate update metadata files (latest.yml, latest-mac.yml, latest-linux.yml)

### Version Management:

- Bump version in `package.json`
- electron-updater compares semantic versions
- Users on v1.0.0 will be notified when v1.0.1 is released

## Testing Auto-Update

### Development:

Set `autoUpdater.forceDevUpdateConfig = true` in `electron/updater.ts` to test in development.

### Production:

1. Publish an initial release (e.g., v1.0.0)
2. Users install this version
3. Publish a new release (e.g., v1.0.1)
4. App will automatically detect and prompt for update

## Important Notes

### Code Signing:

- **macOS**: Requires Apple Developer certificate for production
- **Windows**: Optional but recommended for avoiding security warnings
- Configure in `electron-builder.yaml` when ready

### Update Channels:

Currently configured for `release` channel. You can add:

- Beta channel for testing
- Alpha channel for early access

### User Data:

User data is preserved during updates (stored in app.getPath('userData'))

## Next Steps

To complete the implementation:

1. **Install dependencies** (if not done by CI):

   ```bash
   npm install
   ```

2. **Create a UI component** to show update notifications and progress

3. **Test the workflow** by creating a release on the `release` branch

4. **Configure code signing** for production releases (optional but recommended)

## Example UI Integration

```tsx
import { useEffect, useState } from 'react'

function UpdateNotification() {
  const [updateInfo, setUpdateInfo] = useState(null)

  useEffect(() => {
    const unsubscribe = window.electronAPI?.updater.onUpdateStatus((info) => {
      setUpdateInfo(info)
    })

    return unsubscribe
  }, [])

  if (!updateInfo?.updateAvailable) return null

  return (
    <div className="update-notification">
      <p>Version {updateInfo.version} is available!</p>
      {updateInfo.downloading && (
        <progress value={updateInfo.progress} max="100" />
      )}
      {!updateInfo.downloading && (
        <button onClick={() => window.electronAPI.updater.installUpdate()}>
          Install Update
        </button>
      )}
    </div>
  )
}
```

## Troubleshooting

### Updates Not Detected:

- Ensure version in `package.json` is higher than installed version
- Check that release is published (not draft)
- Verify `latest.yml` exists in the release assets

### Build Failures:

- Check GitHub Actions logs
- Ensure all dependencies are installed
- Verify `GH_TOKEN` has appropriate permissions

### macOS Gatekeeper Issues:

- App needs to be code-signed for auto-update to work on macOS
- Users may need to allow the app in System Preferences > Security

## References

- [electron-updater Documentation](https://www.electron.build/auto-update)
- [electron-builder Publishing](https://www.electron.build/configuration/publish)
