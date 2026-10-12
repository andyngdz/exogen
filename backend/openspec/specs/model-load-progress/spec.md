# Model Load Progress

## Purpose

Real-time progress updates during model loading via Socket.IO events.

## Requirements

### Requirement: Progress Events

The system SHALL emit progress events during model loading.

#### Scenario: Emit load started

- **WHEN** model loading begins
- **THEN** MODEL_LOAD_STARTED event is emitted

#### Scenario: Emit progress updates

- **WHEN** loading progresses
- **THEN** MODEL_LOAD_PROGRESS events are emitted with step/total

#### Scenario: Emit load completed

- **WHEN** model loading completes
- **THEN** MODEL_LOAD_COMPLETED event is emitted

### Requirement: Progress Payload

The system SHALL include step, total, phase, and message in progress events.

#### Scenario: Progress payload structure

- **WHEN** progress event is emitted
- **THEN** payload contains id, step, total, phase, message

### Requirement: Loading Phases

The system SHALL report distinct loading phases.

#### Scenario: Initialization phase

- **WHEN** model initialization starts
- **THEN** phase is "initialization"

#### Scenario: Loading model phase

- **WHEN** model weights are loading
- **THEN** phase is "loading_model"

#### Scenario: Device setup phase

- **WHEN** model is moved to device
- **THEN** phase is "device_setup"

#### Scenario: Optimization phase

- **WHEN** model optimization runs
- **THEN** phase is "optimization"

## Key Entities

- **ModelLoadProgressResponse**: id, step, total, phase, message
- **ModelLoadPhase**: initialization, loading_model, device_setup, optimization
