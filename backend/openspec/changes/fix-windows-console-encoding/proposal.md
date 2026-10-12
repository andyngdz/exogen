# Change: Fix Windows Console Unicode Encoding

## Why

On Windows, third-party libraries like `pypdl` print Unicode progress bar characters (e.g., `█`) that the default `cp1252` console encoding cannot display. This causes `UnicodeEncodeError` crashes when downloading models via Real-ESRGAN upscaler.

## What Changes

- Extend `PlatformService.init()` to reconfigure `sys.stdout` and `sys.stderr` to use UTF-8 encoding on Windows
- This enables proper display of Unicode characters in console output from any library

## Impact

- Affected code: `app/services/platform.py`
- No breaking changes
- No new dependencies
