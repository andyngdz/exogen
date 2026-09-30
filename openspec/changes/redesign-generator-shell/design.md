# Design: Redesign The Generator Shell (Phase 1)

## Problem

`/editor` renders a navbar, a three-pane Allotment (config, preview, history) and a footer. The approved 1b design replaces this with an icon rail, a status bar, and a generator built around one large preview, a floating prompt dock and a tabbed inspector. Styles and LoRA live in modals today, and width, height, images, steps and CFG are free number fields.

## Goals

- `/editor` matches frames 2a, 3a, 3b, 3c and 3f to 3i in Claude Design project "ExoGen" (`Generator Directions.dc.html`, turns 2 and 3).
- Every current generator capability keeps working: text to image, image to image, hires fix, LoRA, styles, seed, sampler, CLIP skip, prompt and negative prompt, grid and single view, download, use as input, history reuse.
- Rail items reach Models, History, Logs and Settings through their current UI until phase 2.

## Non-Goals

- Full Models, History, Settings and Logs views, and the 3-step onboarding.
- Light theme and the drag-over state for the input image.
- Changes to generation requests, socket payloads, or form value shapes.
- Mode-aware hires fix. Hires works in both modes today and keeps doing so.

## Decisions Traced To The User

Recorded 2026-09-30 in the planning conversation:

- Phase 1 is the shell plus the generator; other screens stay on the old UI behind the rail ("Mở UI cũ tạm thời").
- Controls follow the research result: aspect presets sized per model family plus Custom; images per run 1 to 8 as a slider; steps and CFG as sliders with values ("Preset tỉ lệ + Custom").
- Negative prompt sits as a second line in the dock ("Dòng thứ hai trong dock").
- VRAM in use comes from a new backend endpoint ("Thêm endpoint ở backend").
- The History rail item toggles the current history column, hidden by default ("Bấm History trên rail để bật/tắt").
- Build by recomposing existing features, not a rewrite ("Ghép lại từ feature sẵn có").
- The eight-point design summary behind this file was approved before it was written. Fixes from the spec review keep that direction, so task creation proceeds without a second approval round.

## Design

### 1. App shell (`src/features/app-shell/`)

`AppShell` renders `AppRail` (60px), the page content, and `AppStatusBar` (30px) in a full-height column. `src/app/editor/page.tsx` wraps `Editor` in `AppShell`. `AppLayout` stops rendering `AppFooter` on `/editor`; onboarding routes keep `AppFooter` with its own Console and Settings buttons. `EditorNavbar` is deleted; its model selector moves into the generator top bar and model search moves to the rail.

`AppRail` items and what they do in phase 1:

| Item     | Icon            | Action                                              |
| -------- | --------------- | --------------------------------------------------- |
| Generate | sparkles        | Active on `/editor`; no navigation                  |
| Models   | box             | Opens the model search modal                        |
| History  | history         | Toggles the history column; shows active while open |
| Logs     | square-terminal | Opens the backend log drawer                        |
| Settings | settings        | Opens the settings modal through `useSettingsStore` |

Overlays are split into controlled content plus per-surface triggers, so features do not import the shell:

- `BackendLogDrawer` (`isOpen`, `onOpenChange`) holds today's drawer content. `BackendLog`, still used by `AppFooter` on onboarding, becomes its button plus `BackendLogDrawer` with local state.
- `ModelSearchModal` (`isOpen`, `onOpenChange`) holds today's modal content. `ModelSearchOpenIconButton` is deleted with `EditorNavbar`, its only caller.
- `AppShell` mounts `BackendLogDrawer`, `ModelSearchModal` and `SettingsModal`. The first two read the state-only `useAppShellStore` (`isModelSearchOpen`, `isHistoryOpen`, `isLogsOpen`, actions in `APP_SHELL_ACTIONS`, not persisted). `SettingsModal` reads `useSettingsModal`, so the existing `openModal(SettingsTab.MODELS)` call in `useManageDownloadedModel` and the 3g "Memory settings" action keep working.

`AppShell` also mounts the app-wide watchers: `useSocketConnectionWatcher` (section 2) and `useModelLoadProgress` (today's `MODEL_LOAD_*` socket subscription, moved out of `ModelLoadProgressBar`).

### 2. Status bar

`AppStatusBar` shows, left to right:

- Backend state from `useSocketConnectionStore` in `src/cores/sockets/` (`status`: `connecting`, `connected`, `disconnected`; `lastConnectedAt`). `useSocketConnectionWatcher` seeds `status` from `socket.connected` when it mounts, because `initializeBackend` connects the socket before `/editor` renders. After that it follows Socket.IO's `connect`, `disconnect` and `connect_error` events through `useSocketEvent`. Labels: "Backend ready" (success), "Connecting to backend" (warning), "Backend offline" (danger). Only `disconnected` counts as offline for the stage and the dock.
- Primary GPU from the existing `useHardwareQuery`: `name`, plus "CUDA x.y" when `cuda_runtime_version` is set (empty on MPS and CPU). Hidden unless `connected`.
- VRAM in use from `useHardwareMemoryQuery` (`GET /hardware/memory`, `retry: false`). `refetchInterval` returns 5000, or `false` after a 404, so a backend without the endpoint is not polled again. A 404, an error, or `total_bytes === 0` hides the meter.
- The active download from `useDownloadWatcherStore` (`model_id`, `step`): name, bar and percent while a step exists.

Backend contract (implemented and verified in `exogen_backend/app/features/hardware/api.py`, separate pull request):

```text
GET /hardware/memory
200 { "device": "cuda" | "mps" | "cpu", "used_bytes": int, "total_bytes": int }
```

CUDA reads `torch.cuda.mem_get_info(torch.cuda.current_device())` (used = total - free); MPS reads `torch.mps.current_allocated_memory()` and `torch.mps.recommended_max_memory()`; CPU returns zeros.

### 3. Generator layout (`src/features/generators/presentations/Generator.tsx`)

The Allotment and the full-screen model-load loader are removed. `Generator` keeps `FormProvider` and renders:

```text
+----------------------------------------------+-----------+-----------+
| GeneratorTopBar                              |           |           |
+----------------------------------------------+ Generator | Histories |
| GeneratorStage                               | Inspector | (toggled) |
|                         GeneratorDock (float) | 300px     | 300px     |
+----------------------------------------------+-----------+-----------+
```

- `GeneratorTopBar` (`src/features/generators/presentations/`): `ModelSelector` restyled as the outline button from 2a with the family chip, and a spinner and percent from `useModelLoadProgressStore` while loading; the Text/Image switch (`useGeneratorModeTabs`); the Single/Grid switch (`useImageViewMode`, Single maps to `ImageViewMode.SLIDER`).
- `GeneratorStage` (`src/features/generator-stage/`): the existing `GeneratorPreviewer` with an overlay toolbar on the selected image (use as input, download, open viewer), `ImageInput` beside it in image mode (3a), `GenerationPhaseStepper` over the preview while generating (1b), and a recent-runs strip under the preview built from the histories query, with a hover card that reuses `HistoryUseConfigButton`.
- The stage renders exactly one state panel, in this order: backend offline (3f), model loading (3h, with `progress.message` as the phase line), generation failed (3g), no model selected (a panel pointing to the model selector), first run with no items and no history (3i), results.
- `GeneratorDock` (`src/features/generator-dock/`): prompt text area, a "Negative prompt" toggle that reveals a second text area (shown automatically when `negative_prompt` is not empty), read-only summary pills derived from form values, and the generate action. Ctrl+Enter submits.
- `GeneratorInspector` (`src/features/generator-inspector/`): HeroUI `Tabs` with Basic, Hires, LoRA, Styles.

Submission has one owner, `useGeneratorSubmit` (`src/features/generators/states/`). It reads the mode from `useGeneratorModeTabs`, binds `handleSubmit` to `useGenerator().onGenerate` or `useImage2ImageGenerator().onGenerate`, and returns `{ onSubmit, isDisabled, disabledReason }`. The reasons, checked in order: "Backend offline", "Waiting for the model", "Select a model", "Add an input image" (image mode without `initImageBase64`). The dock button, Ctrl+Enter and the 3g "Try again" action all call `onSubmit`. `Text2ImagePanel`, `Image2ImagePanel`, `ModeTabs` and `GeneratorModePanelLayout` are deleted.

### 4. Inspector tabs and controls

- **Basic**: in image mode, the image-to-image section comes first (existing `GeneratorConfigImg2Img`: denoising strength, resize mode). Then come Size, images per run, sampler with steps, CFG and CLIP skip, and seed. Size stays in image mode even though frame 3a omits it: the backend resizes the input to the form's width and height (`exogen_backend/app/features/img2img/service.py:73`), so hiding it would hide a value that shapes the output.
- **Hires**: the hires fix switch in the tab header (moved from `GeneratorConfigFormat`, as in 3b), the existing `GeneratorConfigHiresFix` controls, and an "Output size" line (`width × height → scaled size`).
- **LoRA**: active LoRAs with weight sliders (existing `LoraCard`), and the library list with add and upload (existing `LoraList`, which contains `UploadLoraButton`).
- **Styles**: the search field, selected style chips, the style sections list moved out of `GeneratorConfigStyleModal`, and its NSFW warning as a footer line.

Size presets (`src/features/generator-inspector/services/image-size-service.ts`):

- Presets: `1:1`, `4:3`, `3:4`, `16:9`, `Custom`.
- Base edge by family: SD15 512, SD2 768, SDXL, SD3 and FLUX 1024.
- A preset keeps the base pixel count: `width = round64(base * sqrt(rw / rh))`, `height = round64(base * sqrt(rh / rw))`. SDXL `4:3` gives 1152×896 and `16:9` gives 1344×768; SD15 `1:1` gives 512×512.
- The family used for presets is the last known family. `useModelSelectors` sets `ModelFamily.UNKNOWN` at the start of every load, and transitions to UNKNOWN are ignored. Before any family is known, the base is 512.
- `useImageSizePreset` keeps one piece of local state, `isCustomChosen`. It is set when the user picks Custom and cleared when the user picks a preset. The shown selection is Custom when `isCustomChosen` is true or when width and height match no preset; otherwise it is the matching preset. So Custom stays selected through swaps and typing that land on a preset size.
- Custom shows width and height fields (step 8, minimum 64) and a swap button.
- When the last known family changes and Custom is not shown, the size is recomputed for the new family's version of the same preset. A Custom size is left alone.

Value ranges are enforced where values enter the form, not on mount. `generatorConfigService.clampFormValues` limits `number_of_images` to 1 to 8, `steps` to 1 to 100 and `cfg_scale` to 1 to 30. It runs in `useGeneratorForm` before `methods.reset` (initial load and history reuse through `useUseConfig`) and on persisted-store hydration. The sliders use the same bounds; CFG uses step 0.5, and a stored value with finer precision is kept until the user drags the slider.

Steps also keep the existing 16/24/32 presets (`COMMON_STEPS`).

### 5. Full-screen viewer

`GeneratorPhotoviewModal` becomes the 3c viewer: a full-window HeroUI `Modal` with prompt and seed in the header, "Use as input", "Download" and close, arrow keys, a thumbnail strip, and Escape to close. It keeps `useGeneratorPhotoviewStore` and the carousel state, and the preview toolbar's "open viewer" button opens it.

Prompt and seed come from `useLastRunStore` (state-only, `src/features/generators/states/`). `useGeneratorSubmit` writes `{ prompt, seed }` from the submitted values when a run starts. A seed of -1 displays as "Random". Generated items carry only `path` and `file_name`, and the form may change after a run, so this snapshot is the only accurate source.

### 6. Failure state

`useGenerationErrorStore` (state-only, `src/features/generators/states/`) holds `{ message, step }`. Both generator hooks write it when a run fails. That covers the generation mutation's `onError` and a failure in `addHistory.mutateAsync`, which is caught in `onGenerate`. The generic toast goes away.

- `message` is the backend `detail`: a string is used as is, and an array (FastAPI 422) is joined from its `msg` fields. Without a `detail`, the error message is used.
- `step` is the highest `current_step` in `imageStepEnds`, omitted when no step arrived.
- The store clears when a run starts and when the mode changes.

The 3g panel offers "Try again" (`onSubmit`), "Memory settings" (`openModal(SettingsTab.MEMORY)`) and "Logs" (`APP_SHELL_ACTIONS.openLogs`).

### 7. Removed code

- `EditorNavbar`, `ModelSearchOpenIconButton`, the Allotment dependency and its CSS import.
- `GeneratorConfig` (the left column) and `GeneratorConfigFormat` (its size and hires toggle move to the inspector).
- `ModeTabs`, `Text2ImagePanel`, `Image2ImagePanel`, `GeneratorModePanelLayout`.
- `GeneratorConfigStyleModal` and `GeneratorConfigStyle`'s modal trigger.
- `ExtraModal` and `ExtraSelector`.
- `GeneratorAction`'s view select.
- `ModelLoadProgressBar` and the model-load `FullScreenLoader` in `Generator`.

Tests for removed components are removed with them; tests for moved logic move with it.

## Error Handling

- `/hardware/memory` failures never surface to the user; the meter hides.
- A socket disconnect shows 3f and blocks submission. Socket.IO keeps reconnecting on its own, and "Retry now" calls `socket.connect()`.
- Generation errors render 3g and stay until the next run or a mode switch.

## Testing

- Unit tests:
  - `imageSizeService`: every family and ratio, preset detection, the Custom fallback, and the family switch.
  - `useImageSizePreset`: Custom persists through swap and typing, and UNKNOWN transitions are ignored.
  - `clampFormValues` on initial load and history reuse.
  - `useSocketConnectionStore`: seeding and transitions.
  - `useGenerationErrorStore`: string and array `detail`, and the `addHistory` failure.
  - `useGeneratorSubmit`: reasons and mode dispatch.
  - `useLastRunStore`.
- Component tests:
  - `AppRail` actions per item.
  - `AppStatusBar` states: ready, connecting, offline, no VRAM data, downloading.
  - Settings, logs and model search opening from the shell.
  - Inspector tab switching.
  - Stage state priority.
  - Negative prompt toggle and Ctrl+Enter submit.
- Existing generator, history, LoRA, style, photoview and model-load tests updated to the new structure.
- Visual: screenshots of `/editor` at 1280×800, compared side by side with the Claude Design frames. They use the npx-cached Playwright runner already used in this repo's verification, and add no dependency.
  - 2a, 3a, 3b and 3c come from normal use.
  - 3h comes from selecting a model.
  - 3f comes from stopping the backend.
  - 3g comes from `page.route` answering the generate request with a 500 and a `detail`.
  - 3i comes from an empty history database.
- Gates: `pnpm run lint`, `pnpm run type-check`, `pnpm test`, and `passgate-engine frontend` on every touched file.
