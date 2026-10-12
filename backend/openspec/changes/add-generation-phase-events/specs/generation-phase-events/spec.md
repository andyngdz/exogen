## ADDED Requirements

### Requirement: Generation Phase Events

The system SHALL emit socket events to indicate major phases during image generation.

#### Scenario: Emit image generation phase

- **WHEN** image generation pipeline starts execution
- **THEN** `generation_phase` event is emitted with `current` set to `image_generation`

#### Scenario: Emit upscaling phase

- **WHEN** upscaling/hires fix begins
- **THEN** `generation_phase` event is emitted with `current` set to `upscaling`

#### Scenario: Emit completed phase

- **WHEN** generation pipeline completes
- **THEN** `generation_phase` event is emitted with `current` set to `completed`

### Requirement: Phase Event Payload

The system SHALL include both the available phases and current phase in the event payload.

#### Scenario: Payload with upscaling

- **WHEN** generation uses hires fix
- **THEN** payload contains `{ phases: ["image_generation", "upscaling"], current: "<phase>" }`

#### Scenario: Payload without upscaling

- **WHEN** generation does not use hires fix
- **THEN** payload contains `{ phases: ["image_generation"], current: "<phase>" }`

#### Scenario: Completed is terminal state

- **WHEN** `current` is `completed`
- **THEN** `completed` is not included in `phases` array (it is a terminal state indicator)

### Requirement: Generation Phase Tracker

The system SHALL provide a `GenerationPhaseTracker` class to centralize phase management.

#### Scenario: Tracker initialization

- **WHEN** tracker is created with generation config
- **THEN** tracker determines available phases based on `hires_fix` setting

#### Scenario: Tracker start method

- **WHEN** `tracker.start()` is called
- **THEN** event is emitted with `current` set to `image_generation`

#### Scenario: Tracker upscaling method

- **WHEN** `tracker.upscaling()` is called
- **THEN** event is emitted with `current` set to `upscaling`

#### Scenario: Tracker complete method

- **WHEN** `tracker.complete()` is called
- **THEN** event is emitted with `current` set to `completed`

### Requirement: Centralized Event Emission

The system SHALL provide a dedicated method in SocketService for emitting phase events.

#### Scenario: SocketService method

- **WHEN** phase tracker emits an event
- **THEN** `socket_service.generation_phase(data)` is called with the phase response
