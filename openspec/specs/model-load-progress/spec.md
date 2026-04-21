# Model Load Progress

## Purpose

Visual progress indicator during AI model loading.

## Requirements

### Requirement: Progress Bar Display

The system SHALL display a progress bar during model loading below the navbar.

#### Scenario: Progress bar appears on load start

- **WHEN** model loading starts
- **THEN** a progress bar appears below the navbar

#### Scenario: Progress bar disappears on completion

- **WHEN** model loading completes
- **THEN** the progress bar disappears

### Requirement: Real-Time Updates

The system SHALL show real-time progress updates via Socket.IO events.

#### Scenario: Progress updates in real-time

- **WHEN** backend emits progress events
- **THEN** the progress bar value updates within 500ms

### Requirement: Step Message Display

The system SHALL display the current loading step message.

#### Scenario: Loading phase message

- **WHEN** model is loading
- **THEN** the current phase message is displayed (e.g., "Loading model weights...")

### Requirement: Socket Event Support

The system SHALL support MODEL_LOAD_STARTED, MODEL_LOAD_PROGRESS, and MODEL_LOAD_COMPLETED events.

#### Scenario: Started event handling

- **WHEN** MODEL_LOAD_STARTED event is received
- **THEN** progress bar appears with initial state

#### Scenario: Progress event handling

- **WHEN** MODEL_LOAD_PROGRESS event is received
- **THEN** progress bar updates with step/total percentage

#### Scenario: Completed event handling

- **WHEN** MODEL_LOAD_COMPLETED event is received
- **THEN** progress bar disappears

## Key Entities

- **ModelLoadProgressResponse**: id, step, total, phase, message
- **ModelLoadPhase**: initialization, loading_model, device_setup, optimization
