# Change: History Photoview

## Why

Users need a way to review and compare past generations in detail with fullscreen viewing capability.

## What Changes

- Add fullscreen modal for history items
- Implement left/right navigation between history items
- Support keyboard navigation (arrow keys, Escape)
- Display images grid, config settings, and styles for each history item
- Add continuous loop navigation (last → first, first → last)

## Impact

- Affected specs: history-photoview
- Affected code: HistoryPhotoview modal component, Zustand store for photoview state
