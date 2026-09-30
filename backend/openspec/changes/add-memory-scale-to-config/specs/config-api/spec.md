## MODIFIED Requirements

### Requirement: Config Endpoint

The system SHALL provide GET /config endpoint.

#### Scenario: Fetch config

- **WHEN** GET /config is called
- **THEN** configuration data is returned

#### Scenario: Config includes memory scale factors

- **WHEN** GET /config is called
- **THEN** response contains `gpu_scale_factor` float field (0.1-1.0)
- **AND** response contains `ram_scale_factor` float field (0.1-1.0)

#### Scenario: Default scale factors

- **WHEN** no custom memory configuration exists
- **AND** GET /config is called
- **THEN** `gpu_scale_factor` defaults to 0.5
- **AND** `ram_scale_factor` defaults to 0.5

#### Scenario: Custom scale factors

- **WHEN** memory configuration has been set via /hardware/max-memory
- **AND** GET /config is called
- **THEN** `gpu_scale_factor` reflects the configured value
- **AND** `ram_scale_factor` reflects the configured value

## MODIFIED Requirements

### Requirement: Extensible Schema

The system SHALL use extensible schema for future config items.

#### Scenario: Add new config

- **WHEN** new config type is needed
- **THEN** schema can be extended without breaking changes

#### Scenario: Memory scale factors in schema

- **WHEN** ConfigResponse schema is defined
- **THEN** it includes `gpu_scale_factor` (float, 0.1-1.0)
- **AND** it includes `ram_scale_factor` (float, 0.1-1.0)
