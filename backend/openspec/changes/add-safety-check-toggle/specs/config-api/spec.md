# Config API Delta

## ADDED Requirements

### Requirement: Safety Check Setting

The system SHALL expose safety check setting via config API.

#### Scenario: Get safety check status

- **WHEN** GET /config is called
- **THEN** response contains `safety_check_enabled` boolean field
- **AND** value reflects current database setting (default: true)

#### Scenario: Toggle safety check

- **WHEN** PUT /config/safety-check is called with `{"enabled": false}`
- **THEN** safety check setting is saved to database
- **AND** response confirms the new value

#### Scenario: Safety check affects generation

- **WHEN** safety_check_enabled is false
- **AND** image generation runs
- **THEN** safety checker is skipped
- **AND** nsfw_content_detected returns [false] for all images

## MODIFIED Requirements

### Requirement: Extensible Schema

The system SHALL use extensible schema for future config items.

#### Scenario: Config response includes safety check

- **WHEN** config is fetched
- **THEN** response contains `safety_check_enabled` alongside `upscalers`

## Key Entities

- **ConfigResponse**: upscalers, safety_check_enabled (bool)
- **SafetyCheckRequest**: enabled (bool)
