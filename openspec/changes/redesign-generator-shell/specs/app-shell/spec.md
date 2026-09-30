## ADDED Requirements

### Requirement: Icon Rail On The Editor Screen

The `/editor` screen SHALL render a 60px icon rail with Generate, Models and History at the top and Logs and Settings at the bottom, in place of the editor navbar and the app footer.

#### Scenario: Rail replaces navbar and footer

- **WHEN** the user opens `/editor`
- **THEN** the rail shows the Generate, Models, History, Logs and Settings items, with Generate marked active
- **AND** neither the editor navbar nor the app footer renders

#### Scenario: Onboarding routes keep the current layout

- **WHEN** the user opens `/`, `/gpu-detection`, `/max-memory` or `/model-recommendations`
- **THEN** the rail and the status bar do not render

### Requirement: Rail Items Open The Current UI Until Phase 2

Rail items for screens that are not rebuilt yet SHALL open the existing UI for that screen.

#### Scenario: Models opens model search

- **WHEN** the user presses the Models rail item
- **THEN** the model search modal opens

#### Scenario: History toggles the history column

- **WHEN** the user presses the History rail item while the history column is hidden
- **THEN** the history column appears to the right of the inspector and the History item shows as active
- **AND** pressing the item again hides the column

#### Scenario: Logs opens the log drawer

- **WHEN** the user presses the Logs rail item
- **THEN** the backend log drawer opens

#### Scenario: Settings opens the settings modal

- **WHEN** the user presses the Settings rail item
- **THEN** the settings modal opens

#### Scenario: Settings opened from another feature

- **WHEN** code on `/editor` calls `useSettingsStore.openModal(SettingsTab.MODELS)`
- **THEN** the settings modal opens on the Model management tab

#### Scenario: Onboarding keeps its footer controls

- **WHEN** the user presses Console in the onboarding footer
- **THEN** the backend log drawer opens

### Requirement: Status Bar

The `/editor` screen SHALL render a 30px status bar showing backend state, the primary GPU, VRAM in use, and the active model download.

#### Scenario: Backend connected

- **WHEN** the socket is connected
- **THEN** the status bar shows "Backend ready" with the primary GPU name and CUDA runtime version

#### Scenario: Socket connected before the shell mounts

- **WHEN** `/editor` renders after `initializeBackend` has already connected the socket
- **THEN** the status bar shows "Backend ready" on first render

#### Scenario: Connection in progress

- **WHEN** the socket has not connected yet and has not disconnected
- **THEN** the status bar shows "Connecting to backend"
- **AND** the stage does not show the offline panel

#### Scenario: Backend disconnected

- **WHEN** the socket disconnects
- **THEN** the status bar shows "Backend offline"
- **AND** the GPU and VRAM entries are hidden

#### Scenario: VRAM in use is reported

- **WHEN** `GET /hardware/memory` returns `used_bytes` and a non-zero `total_bytes`
- **THEN** the status bar shows a VRAM meter with used and total in GB
- **AND** the value refreshes every 5 seconds

#### Scenario: VRAM data is unavailable

- **WHEN** `GET /hardware/memory` returns 404, fails, or returns `total_bytes` of 0
- **THEN** the VRAM meter is hidden and no error is shown
- **AND** after a 404 the endpoint is not polled again

#### Scenario: GPU without CUDA

- **WHEN** `/hardware` reports a primary GPU with an empty `cuda_runtime_version`
- **THEN** the status bar shows the GPU name without a CUDA version

#### Scenario: A model is downloading

- **WHEN** the download watcher has an active model id and a progress step
- **THEN** the status bar shows the model id, a progress bar and the percent

### Requirement: Hardware Memory Endpoint

The backend SHALL expose `GET /hardware/memory` returning `device`, `used_bytes` and `total_bytes` for the active accelerator. This requirement is implemented and verified in `exogen_backend`.

#### Scenario: CUDA device

- **WHEN** the backend runs on CUDA and `GET /hardware/memory` is called
- **THEN** it returns `device` "cuda", `total_bytes` from `torch.cuda.mem_get_info()` and `used_bytes` as total minus free

#### Scenario: MPS device

- **WHEN** the backend runs on Apple MPS
- **THEN** it returns `device` "mps", `used_bytes` from `torch.mps.current_allocated_memory()` and `total_bytes` from `torch.mps.recommended_max_memory()`

#### Scenario: No accelerator

- **WHEN** the backend runs on CPU
- **THEN** it returns `device` "cpu" with `used_bytes` and `total_bytes` of 0
