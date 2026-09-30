# Change: Model Load Progress Bar

## Why
Users had no feedback during model loading which could take significant time.

## What Changes
- Added progress bar during model loading
- Implemented Socket.IO events for real-time progress updates
- Show loading percentage and status to frontend

## Impact
- Affected code: `app/cores/model_manager/`, Socket.IO events
