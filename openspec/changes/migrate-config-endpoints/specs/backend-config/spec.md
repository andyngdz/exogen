# Backend Configuration - Spec Delta

## MODIFIED Requirements

### Requirement: Null-Safe Config Hook

The system SHALL provide a `useConfig()` wrapper hook that returns config with default values, eliminating null-checking in consuming components.

#### Scenario: Default values include device_index

- **WHEN** config is not yet loaded
- **THEN** `useConfig()` returns config with `device_index: -1` (NOT_FOUND sentinel value)

### Requirement: Config API Response

The system SHALL fetch configuration from GET /config/ endpoint.

#### Scenario: Config includes device_index

- **WHEN** config is fetched
- **THEN** response includes `device_index` field indicating selected GPU (-1 = not configured, 0+ = GPU index)

## ADDED Requirements

### Requirement: Device Selection via Config API

The system SHALL set active device using PUT /config/device endpoint.

#### Scenario: Select GPU device

- **GIVEN** user selects a GPU device
- **WHEN** `api.selectDevice({ device_index: N })` is called
- **THEN** PUT /config/device is called with `{ device_index: N }`
- **AND** the full `BackendConfig` is returned

#### Scenario: Select CPU mode

- **GIVEN** user selects CPU mode
- **WHEN** `api.selectDevice({ device_index: -1 })` is called
- **THEN** PUT /config/device is called with `{ device_index: -1 }`
- **AND** the full `BackendConfig` is returned

### Requirement: Max Memory via Config API

The system SHALL set memory scale factors using PUT /config/max-memory endpoint.

#### Scenario: Set memory scale factors

- **GIVEN** user configures memory allocation
- **WHEN** `api.setMaxMemory({ gpu_scale_factor, ram_scale_factor })` is called
- **THEN** PUT /config/max-memory is called with the scale factors
- **AND** the full `BackendConfig` is returned

## REMOVED Requirements

### Requirement: Separate Device Index Endpoint

The system no longer provides `api.getDeviceIndex()` - device index is now part of the config response.

### Requirement: Hardware Device Endpoints

The system no longer uses POST /hardware/device or POST /hardware/max-memory - these have been consolidated into /config/\*.
