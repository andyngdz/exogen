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

#### Scenario: Config includes total memory

- **WHEN** GET /config is called
- **THEN** response contains `total_gpu_memory` integer field (bytes)
- **AND** response contains `total_ram_memory` integer field (bytes)

#### Scenario: Total memory reflects system hardware

- **WHEN** GET /config is called
- **THEN** `total_gpu_memory` reflects detected GPU memory in bytes
- **AND** `total_ram_memory` reflects system RAM in bytes

## MODIFIED Requirements

### Requirement: Extensible Schema

The system SHALL use extensible schema for future config items.

#### Scenario: Add new config

- **WHEN** new config type is needed
- **THEN** schema can be extended without breaking changes

#### Scenario: Memory fields in schema

- **WHEN** ConfigResponse schema is defined
- **THEN** it includes `gpu_scale_factor` (float, 0.1-1.0)
- **AND** it includes `ram_scale_factor` (float, 0.1-1.0)
- **AND** it includes `total_gpu_memory` (int, bytes)
- **AND** it includes `total_ram_memory` (int, bytes)
