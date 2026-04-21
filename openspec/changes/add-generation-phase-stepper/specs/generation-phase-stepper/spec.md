## ADDED Requirements

### Requirement: Generation Phase Socket Event

The system SHALL receive `generation_phase` socket events from the backend during image generation.

#### Scenario: Receive phase event with payload

- **WHEN** the backend emits a `generation_phase` event
- **THEN** the frontend receives a payload containing `phases` (list of phases) and `current` (active phase)

#### Scenario: Phase values

- **WHEN** a generation phase event is received
- **THEN** the `current` field contains one of: `image_generation`, `upscaling`, or `completed`

### Requirement: Generation Phase State Management

The system SHALL maintain generation phase state using a Zustand store.

#### Scenario: Store phase update

- **WHEN** a `generation_phase` event is received with `current` not equal to `completed`
- **THEN** the store updates with the received `phases` and `current` values

#### Scenario: Reset on completion

- **WHEN** a `generation_phase` event is received with `current` equal to `completed`
- **THEN** the store resets to initial state (phases and current become undefined)

### Requirement: Generation Phase Stepper Display

The system SHALL display a floating stepper UI during image generation.

#### Scenario: Stepper visibility

- **WHEN** generation phases are active (phases and current are defined)
- **THEN** a floating stepper appears at bottom-center of the screen

#### Scenario: Stepper hidden on completion

- **WHEN** generation completes (current becomes `completed`)
- **THEN** the floating stepper disappears

#### Scenario: Stepper container styling

- **WHEN** the stepper is visible
- **THEN** it displays with rounded-2xl corners, backdrop blur, and semi-transparent background

### Requirement: Generation Phase Step Indicator

The system SHALL indicate the current generation phase with a visual indicator.

#### Scenario: Current step indicator

- **WHEN** a step is the current phase
- **THEN** it displays a pulsing dot indicator (animate-pulse) before the step label

#### Scenario: Non-current step display

- **WHEN** a step is not the current phase
- **THEN** it displays only the step label without an indicator

#### Scenario: Step labels

- **WHEN** displaying a phase
- **THEN** `image_generation` displays as "Image Generation" and `upscaling` displays as "Upscaling"

### Requirement: Dynamic Phase List

The system SHALL display only the phases that will occur during generation.

#### Scenario: Single phase generation

- **WHEN** generation does not use hires fix
- **THEN** the stepper displays only "Image Generation"

#### Scenario: Two phase generation

- **WHEN** generation uses hires fix
- **THEN** the stepper displays "Image Generation" and "Upscaling" separated by a dash
