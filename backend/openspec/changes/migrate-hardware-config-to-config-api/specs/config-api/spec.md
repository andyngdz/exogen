## MODIFIED Requirements

### Requirement: Config Endpoint

The system SHALL provide GET /config endpoint.

#### Scenario: Fetch config

- **WHEN** GET /config is called
- **THEN** configuration data is returned

#### Scenario: Config includes device index

- **WHEN** GET /config is called
- **THEN** response contains `device_index` integer field
- **AND** value reflects current database setting (default: 0)
- **AND** -1 indicates CPU mode

## ADDED Requirements

### Requirement: Device Selection

The system SHALL allow setting the active device via config API.

#### Scenario: Set device index

- **WHEN** PUT /config/device is called with `{"device_index": 1}`
- **THEN** device index is saved to database
- **AND** response returns updated ConfigResponse

#### Scenario: Invalid device index rejected

- **WHEN** PUT /config/device is called with device_index < -1
- **THEN** request is rejected with 422 validation error

### Requirement: Memory Configuration

The system SHALL allow setting memory limits via config API.

#### Scenario: Set memory scale factors

- **WHEN** PUT /config/max-memory is called with `{"gpu_scale_factor": 0.8, "ram_scale_factor": 0.7}`
- **THEN** scale factors are saved to database
- **AND** response returns updated ConfigResponse

#### Scenario: Scale factor validation

- **WHEN** PUT /config/max-memory is called with scale factor outside 0.1-1.0 range
- **THEN** request is rejected with 422 validation error
