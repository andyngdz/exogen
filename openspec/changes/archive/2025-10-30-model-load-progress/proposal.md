# Change: Model Load Progress Bar

## Why

Model loading can take 30 seconds to several minutes with no visual feedback. Users need to know loading is progressing and not stuck.

## What Changes

- Add progress bar component below navbar during model loading
- Implement Socket.IO event handling for MODEL_LOAD_STARTED, MODEL_LOAD_PROGRESS, MODEL_LOAD_COMPLETED
- Display current loading phase message
- Auto-hide progress bar on completion

## Impact

- Affected specs: model-load-progress
- Affected code: Progress bar component, Socket.IO event handlers, Zustand store
