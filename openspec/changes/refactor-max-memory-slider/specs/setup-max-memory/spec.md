# Setup Max Memory Slider

## ADDED Requirements

### Requirement: Dual slider-based scale factor selection

The Max Memory setup step SHALL replace the radio buttons with two HeroUI Sliders (GPU and RAM) that advertise visible steps (HeroUI `showSteps`) for each supported scale factor between 50% and 90%.

#### Scenario: GPU slider visible steps

- **WHEN** the user opens the Max Memory setup step
- **THEN** they see a horizontal GPU slider with dots/marks for 50%, 60%, 70%, 80%, and 90%
- **AND** dragging the GPU thumb snaps only to those discrete values.

#### Scenario: RAM slider visible steps

- **WHEN** the user opens the Max Memory setup step
- **THEN** they see a horizontal RAM slider with the same dots/marks
- **AND** dragging the RAM thumb snaps only to those discrete values.

#### Scenario: Form integration

- **WHEN** the user drags either slider thumb to a new value
- **THEN** the corresponding React Hook Form field (`gpuScaleFactor` or `ramScaleFactor`) updates immediately
- **AND** the value submitted to `/hardware/max-memory` includes both percentages independently.

### Requirement: Live preview and color feedback

The system SHALL provide immediate visual feedback (copy + color) that reflects each slider position and communicates risk when selecting higher percentages.

#### Scenario: Preview updates GPU/RAM copy

- **WHEN** either slider value changes
- **THEN** the preview text recalculates GPU bytes using the GPU slider and RAM bytes using the RAM slider so users understand asymmetric configurations before saving.

#### Scenario: Threshold colors preserved per slider

- **WHEN** a slider value is ≤50%
- **THEN** that slider uses the existing "success" styling
- **WHEN** the value is between 50% and 70%
- **THEN** it uses "warning" styling
- **WHEN** the value is ≥70%
- **THEN** it uses "danger" styling, matching the previous radio affordances for that resource.
