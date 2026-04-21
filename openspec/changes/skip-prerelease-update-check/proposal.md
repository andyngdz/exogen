# Change: Skip Auto-Update Check for Pre-release Versions

## Why

Pre-release versions (e.g., `v1.16.0-beta.22`) don't have `latest-*.yml` metadata files in their GitHub releases because building Electron apps is resource-intensive and only runs for stable releases on the `release` branch. This causes unhandled promise rejections and console spam when running beta versions.

## What Changes

- Skip auto-update checks entirely for pre-release versions (versions containing `-` like `-beta`, `-alpha`, `-rc`)
- Log a message indicating the update check was skipped for pre-release versions
- Prevents 404 errors from electron-updater trying to fetch missing `latest-linux.yml`, `latest-mac.yml`, or `latest.yml` files

## Impact

- Affected specs: `auto-update`
- Affected code: `electron/updater.ts`
- User experience: Beta users won't see errors in the console; stable users are unaffected
