# Tasks: Redesign The Generator Shell (Phase 1)

Dependency levels: level 0 is units 1 to 5, level 1 is units 6, 8 and 9, level 2 is units 7 and 10, then unit 11, then unit 12. Units at the same level with disjoint `writes` are `parallel-safe`. Every unit leaves `pnpm run type-check`, `pnpm run lint` and `pnpm test` passing. The old generator keeps working until unit 11 switches `/editor` to the new parts.

- [x] Archive the checked-off `add-img2img-ui`, `add-generator-photoview` and `add-generation-phase-stepper` changes before unit 1, and cover their panel requirements with the `img2img-ui` delta.

## 1. Backend Hardware Memory Endpoint [depends-on: -] [writes: ../exogen_backend/app/features/hardware/, ../exogen_backend/tests/app/features/hardware/] [parallel-safe: yes]

- [ ] Add `GET /hardware/memory` returning `{ device, used_bytes, total_bytes }`:
  - CUDA: `torch.cuda.mem_get_info(torch.cuda.current_device())`.
  - MPS: `current_allocated_memory` and `recommended_max_memory`.
  - CPU: zeros.
- [ ] Add pytest coverage for each device branch with torch mocked, and open the pull request in `exogen_backend`.

## 2. Hardware Memory Query [depends-on: -] [writes: src/services/api.ts, src/types/api.ts, src/cores/api-queries/] [parallel-safe: yes]

- [ ] Add `HardwareMemoryResponse`, `api.getHardwareMemory()` and `useHardwareMemoryQuery`:
  - `retry: false`.
  - `refetchInterval` of 5000, or `false` after a 404.
- [ ] Test that a 404 and a zero `total_bytes` both resolve to "no VRAM data" for callers, and that a 404 stops polling.

## 3. Socket Connection State [depends-on: -] [writes: src/cores/sockets/] [parallel-safe: yes]

- [ ] Add the state-only `useSocketConnectionStore` (`status`: `connecting`, `connected`, `disconnected`; `lastConnectedAt`) with `SOCKET_CONNECTION_ACTIONS`, including `reconnect` (calls `socket.connect()`).
- [ ] Add `SocketEvents.CONNECT`, `DISCONNECT` and `CONNECT_ERROR`, and `useSocketConnectionWatcher`, which seeds `status` from `socket.connected` on mount and then follows the events.
- [ ] Test seeding when the socket is already connected, each transition, and `reconnect`.

## 4. Controlled Overlays And Shell Store [depends-on: -] [writes: src/features/app-shell/states/, src/features/backend-logs/presentations/, src/features/model-search/presentations/] [parallel-safe: yes]

- [ ] Add the state-only `useAppShellStore` (`isModelSearchOpen`, `isHistoryOpen`, `isLogsOpen`, not persisted) with `APP_SHELL_ACTIONS`.
- [ ] Extract `BackendLogDrawer` (`isOpen`, `onOpenChange`) from `BackendLog`, and keep `BackendLog` as the onboarding footer's button plus the drawer.
- [ ] Extract `ModelSearchModal` (`isOpen`, `onOpenChange`) from `ModelSearchOpenIconButton`.
- [ ] Update their tests.

## 5. Image Size Presets And Basic Controls [depends-on: -] [writes: src/features/generator-inspector/services/, src/features/generator-inspector/states/, src/features/generator-inspector/presentations/basic/] [parallel-safe: yes]

- [ ] Add `imageSizeService`: family base edges, preset sizes rounded to 64, and preset detection. Test every family and ratio, including SDXL 4:3 = 1152×896 and 16:9 = 1344×768.
- [ ] Add `useImageSizePreset`:
  - `isCustomChosen` state.
  - Last known family, ignoring UNKNOWN.
  - Recompute on a family change unless Custom shows.
  - Tests for swap, typing, and a reload through UNKNOWN.
- [ ] Build the Basic tab:
  - Size presets, with Custom width, height (step 8, minimum 64) and swap.
  - Images per run slider 1 to 8; steps slider 1 to 100 with the 16/24/32 presets; CFG slider 1 to 30, step 0.5.
  - The existing sampler, CLIP skip, seed and `GeneratorConfigImg2Img` components, with img2img first in image mode.

## 6. Generator Run State And Submission [depends-on: 3] [writes: src/features/generators/states/, src/features/generators/services/] [parallel-safe: yes]

- [ ] Add `generatorConfigService.clampFormValues` (`number_of_images` 1 to 8, `steps` 1 to 100, `cfg_scale` 1 to 30), and apply it in `useGeneratorForm` before every `reset` and on store hydration. Test the initial load and history reuse through `useUseConfig`.
- [ ] Add the state-only `useGenerationErrorStore`.
  - Write it from both generator hooks on a mutation error and on an `addHistory` failure.
  - Take `detail` as a string, or join the `msg` fields when it is an array.
  - Take `step` as the highest `current_step`.
  - Clear it on run start and on mode change.
  - Remove the generic toast.
- [ ] Add the state-only `useLastRunStore` (`prompt`, `seed`), and `useGeneratorSubmit`.
  - Dispatch by mode.
  - Return disabled reasons in order: backend offline, model loading, no model, no input image.
  - Snapshot the last run at submit.
  - Test each part.

## 7. Full-Screen Viewer [depends-on: 6] [writes: src/features/generator-photoview/] [parallel-safe: yes]

- [ ] Restyle `GeneratorPhotoviewModal` as the 3c full-window viewer:
  - A header with the prompt and seed from `useLastRunStore`, where -1 shows as "Random".
  - "Use as input", "Download" and close.
  - Arrow keys, a thumbnail strip, and Escape to close.
- [ ] Update the photoview tests for the header, navigation, actions and close.

## 8. App Shell [depends-on: 2, 3, 4] [writes: src/features/app-shell/presentations/, src/app/editor/, src/app/app-layout.tsx, src/features/editors/, src/features/model-search/presentations/ModelSearchOpenIconButton.tsx, src/features/model-load-progress/states/] [parallel-safe: yes]

- [ ] Build `AppShell`, `AppRail` and `AppStatusBar`.
  - `AppShell` mounts `BackendLogDrawer`, `ModelSearchModal`, `SettingsModal`, `useSocketConnectionWatcher` and `useModelLoadProgress`.
  - Wrap `/editor` in `AppShell`, and stop rendering `AppFooter` on `/editor`.
- [ ] Delete `EditorNavbar` and `ModelSearchOpenIconButton`. Keep `ModelSelector` in `Editor` until unit 11 moves it into the top bar.
- [ ] Component tests:
  - Each rail action.
  - Each status bar state: ready, connecting, offline, GPU without CUDA, no VRAM data, downloading.
  - `openModal(SettingsTab.MODELS)` opening settings on `/editor`.
  - The onboarding footer still opening the log drawer.

## 9. Inspector Tabs [depends-on: 5] [writes: src/features/generator-inspector/presentations/] [parallel-safe: yes]

- [ ] Build `GeneratorInspector` with four tabs:
  - Basic, from unit 5.
  - Hires: the hires switch in the header, `GeneratorConfigHiresFix`, and the output size line.
  - LoRA: `LoraCard` and `LoraList`.
  - Styles: search, selected chips, the style sections, and the NSFW warning line.
- [ ] Component tests for tab switching, the hires switch, adding a LoRA, and selecting a style without a modal.

## 10. Prompt Dock And Stage [depends-on: 3, 6] [writes: src/features/generator-dock/, src/features/generator-stage/] [parallel-safe: yes]

- [ ] Build `GeneratorDock`:
  - Prompt and a negative prompt toggle, open automatically when set.
  - Read-only pills.
  - Generate through `useGeneratorSubmit`, with Ctrl+Enter.
  - The first disabled reason above the button.
- [ ] Build `GeneratorStage`:
  - The previewer with its overlay toolbar, and the input beside the output in image mode.
  - The phase stepper, and the recent-runs strip with the "Use this config" hover card.
  - State panels in priority order: offline, model loading with the phase message, failed, no model, first run, results.
- [ ] Tests for:
  - Pill derivation.
  - Disabled reasons, and Ctrl+Enter while disabled.
  - The negative prompt toggle.
  - Stage state priority.
  - The 3g actions.

## 11. Generator Layout Switch [depends-on: 4, 7, 8, 9, 10] [writes: src/features/generators/presentations/, src/features/generator-modes/, src/features/generator-configs/presentations/, src/features/generator-config-formats/, src/features/generator-config-styles/presentations/, src/features/extra/, src/features/generator-actions/, src/features/model-selectors/presentations/, src/features/model-load-progress/presentations/, src/features/histories/presentations/Histories.tsx, src/features/editors/, package.json, pnpm-lock.yaml] [parallel-safe: no]

- [ ] Recompose `Generator` from `GeneratorTopBar`, `GeneratorStage`, `GeneratorDock`, `GeneratorInspector` and the history column toggled by `isHistoryOpen`. Restyle `ModelSelector` with load progress for the top bar.
- [ ] Delete the following, with their tests:
  - The Allotment layout and dependency.
  - The model-load `FullScreenLoader`.
  - `GeneratorConfig` and `GeneratorConfigFormat`.
  - `ModeTabs`, `Text2ImagePanel`, `Image2ImagePanel` and `GeneratorModePanelLayout`.
  - `GeneratorConfigStyleModal`, `ExtraModal` and `ExtraSelector`.
  - The view select in `GeneratorAction`, and `ModelLoadProgressBar`.

## 12. Verification [depends-on: 1, 11] [writes: -] [parallel-safe: no]

- [ ] Run `openspec validate redesign-generator-shell --strict`.
- [ ] Run `pnpm run lint`, `pnpm run type-check`, `pnpm test`, and `passgate-engine frontend` on every touched file.
- [ ] Capture `/editor` at 1280×800 with the npx-cached Playwright runner and compare each capture with its Claude Design frame:
  - 2a, 3a, the 3b tabs and 3c in normal use.
  - 3h by selecting a model.
  - 3f by stopping the backend.
  - 3g with `page.route` returning a 500 with a `detail`.
  - 3i with an empty history.
- [ ] Generate a real image end to end against the running backend in both modes, with hires fix, one LoRA and one style.
