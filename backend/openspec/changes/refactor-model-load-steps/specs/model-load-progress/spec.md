## MODIFIED Requirements

### Requirement: Progress Payload

The system SHALL include step, total, phase, and message in progress events with total=8 steps derived from centralized step definitions.

#### Scenario: Progress payload structure

- **WHEN** progress event is emitted
- **THEN** payload contains id, step (1-8), total (8), phase, message

#### Scenario: Step count derived from enum

- **WHEN** TOTAL_STEPS is accessed
- **THEN** it equals the number of ModelLoadStep enum members

#### Scenario: Step definitions centralized

- **WHEN** a progress step is emitted
- **THEN** message and phase are looked up from STEP_CONFIG by ModelLoadStep enum
