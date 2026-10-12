## MODIFIED Requirements

### Requirement: Extensible Schema

The system SHALL use extensible schema for future config items.

#### Scenario: Add new config

- **WHEN** new config type is needed
- **THEN** schema can be extended without breaking changes

#### Scenario: Config response built by service

- **WHEN** any config endpoint returns ConfigResponse
- **THEN** response is built by `ConfigService.get_config(db)` method
- **AND** all endpoints return consistent response structure
