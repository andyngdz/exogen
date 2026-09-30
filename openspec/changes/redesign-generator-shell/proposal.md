# Proposal: Redesign The Generator Shell (Phase 1)

## Change ID

`redesign-generator-shell`

## Summary

Rebuild the `/editor` screen on the approved 1b canvas-first design: an icon rail, a shared status bar, and a generator made of a top bar, a preview stage, a floating prompt dock, and a tabbed inspector. This is phase 1 of 3. Models, History, Settings and Logs keep their current UI behind the rail until phase 2, and onboarding moves in phase 3.

## Why

- The user approved direction 1b and the full frame set (2a to 2g, 3a to 3n) in Claude Design project "ExoGen".
- The current three-pane Allotment layout spreads settings, preview and history across the screen; 1b gives the image most of the window and keeps every setting one tab away.
- The Styles and Extra (LoRA) modals hide settings the user changes on almost every run; the inspector tabs keep them visible next to the preview.

## What Changes

- Add an `app-shell` feature: `AppShell`, `AppRail` and `AppStatusBar`, used by `/editor` in place of `EditorNavbar` and `AppFooter`.
- Rail items open the existing UI for screens that phase 2 rebuilds: Models opens the model search modal, History toggles the current history column, Logs opens the backend log drawer, Settings opens the settings modal.
- The status bar shows backend state from the socket connection, the GPU from `/hardware`, VRAM in use from a new backend endpoint, and the active model download.
- Rebuild the generator as `GeneratorTopBar`, `GeneratorStage`, `GeneratorDock` and `GeneratorInspector`, reusing the existing form, stores, sockets and config components.
- Replace width/height inputs with aspect-ratio presets sized per model family plus a Custom option, and turn images per run, steps and CFG into sliders with visible values.
- Move the Styles and LoRA lists into inspector tabs and remove `GeneratorConfigStyleModal` and `ExtraModal`.
- Restyle `GeneratorPhotoviewModal` as a full-screen viewer.
- Add stage states for first run, model loading, generation failure and backend offline.
- In `backend/`, add `GET /hardware/memory`.

## Non-Goals

- Full views for Models, History, Settings and Logs (phase 2).
- The 3-step onboarding (phase 3).
- Light theme, drag-over state for the input image, and changes to generation logic or API payloads.

## Impact

- Affected code: `src/app/editor/`, `src/app/app-layout.tsx`, `src/features/editors/`, `src/features/generators/`, `src/features/generator-*`, `src/features/extra*`, `src/features/generator-photoview/`, `src/features/histories/` (column toggle only), `src/features/settings/`, `src/features/backend-logs/`, `src/features/model-search/`, `src/features/model-selectors/`, `src/features/model-load-progress/`, `src/features/app-footer/`, `src/cores/sockets/`, `src/services/api.ts`, `src/types/api.ts`.
- New feature folders: `src/features/app-shell/`, `src/features/generator-inspector/`, `src/features/generator-dock/`, `src/features/generator-stage/`.
- Backend: `backend/app/features/hardware/` gains one read-only route.
- New OpenSpec capabilities: `app-shell`, `generator-workspace`; modified: `lora-integration`, `model-load-progress`.
- Archives `add-img2img-ui`, `add-generator-photoview` and `add-generation-phase-stepper`, and modifies the `img2img-ui` capability they created.

## Risks / Mitigations

- **Large diff on the main screen**: the work splits into dependency-ordered review units; every unit keeps the app building and the existing generate flow working.
- **Frontend merges before the backend endpoint ships**: the status bar treats a 404 from `/hardware/memory` as "no VRAM data" and hides the meter.
- **Preset sizes change existing saved W/H**: a stored width/height that matches no preset shows as Custom, so no saved value is rewritten.
