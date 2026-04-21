## ADDED Requirements

### Requirement: Memory Configuration in Settings

The system SHALL provide GPU and RAM memory allocation sliders in the Settings modal **Memory** tab.

#### Scenario: Sliders display current values

- **WHEN** user opens the Settings modal Memory tab
- **THEN** GPU and RAM allocation sliders display current values from backend config

#### Scenario: User adjusts memory allocation

- **WHEN** user moves GPU or RAM slider in the Memory tab
- **THEN** the new value is persisted to the backend via `api.setMaxMemory()`

### Requirement: Memory Preview Display

The system SHALL display a preview of calculated memory limits based on slider values.

#### Scenario: Preview shows calculated limits

- **WHEN** user views memory configuration section
- **THEN** preview shows calculated GPU memory and RAM limits in human-readable format

#### Scenario: Preview updates on slider change

- **WHEN** user adjusts a memory slider
- **THEN** preview immediately reflects the new calculated memory limit

### Requirement: Props-Based Reusable Components

The system SHALL provide reusable memory slider components in `src/cores/presentations/` that accept props instead of relying on form context.

#### Scenario: MemoryScaleFactorItem accepts value prop

- **WHEN** `MemoryScaleFactorItem` is rendered
- **THEN** it displays the slider with the provided `value` and calls `onChange` when adjusted

#### Scenario: MemoryScaleFactorItems accepts scale factor props

- **WHEN** `MemoryScaleFactorItems` is rendered
- **THEN** it displays both sliders using provided `gpuScaleFactor`, `ramScaleFactor` values

#### Scenario: MemoryScaleFactorPreview accepts scale factor props

- **WHEN** `MemoryScaleFactorPreview` is rendered
- **THEN** it calculates and displays limits using provided `gpuScaleFactor`, `ramScaleFactor` values

### Requirement: Context-Specific Containers

The system SHALL use separate container components for setup flow and settings, each managing their own form state.

#### Scenario: Setup flow uses MaxMemoryScaleFactor container

- **WHEN** user is in setup flow
- **THEN** `MaxMemoryScaleFactor` manages form state and navigation

#### Scenario: Settings uses SettingsMemoryConfig container

- **WHEN** user is in the Settings modal Memory tab
- **THEN** `SettingsMemoryConfig` (via `useSettingsMemory`) reads current values from `useConfig()` and calls `api.setMaxMemory()` on slider changes to keep backend and UI in sync
