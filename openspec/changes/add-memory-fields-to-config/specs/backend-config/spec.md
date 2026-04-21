# Backend Configuration - Spec Delta

## MODIFIED Requirements

### Requirement: Null-Safe Config Hook

The system SHALL provide a `useConfig()` wrapper hook that returns config with default values, eliminating null-checking in consuming components.

#### Scenario: Empty array and zero defaults

- **WHEN** config is not yet loaded
- **THEN** `useConfig()` returns `{ upscalers: [], safety_check_enabled: true, gpu_scale_factor: 0, ram_scale_factor: 0, total_gpu_memory: 0, total_ram_memory: 0 }`

## ADDED Requirements

### Requirement: Memory Configuration Fields

The system SHALL expose memory configuration fields from the backend config response.

#### Scenario: GPU scale factor available

- **WHEN** config is loaded
- **THEN** `gpu_scale_factor` field is available as a number between 0 and 1

#### Scenario: RAM scale factor available

- **WHEN** config is loaded
- **THEN** `ram_scale_factor` field is available as a number between 0 and 1

#### Scenario: Total GPU memory available

- **WHEN** config is loaded
- **THEN** `total_gpu_memory` field is available as total GPU memory in bytes

#### Scenario: Total RAM memory available

- **WHEN** config is loaded
- **THEN** `total_ram_memory` field is available as total RAM in bytes

### Requirement: Memory Preview Uses Config

The system SHALL display memory preview using config data instead of a separate memory endpoint.

#### Scenario: Memory preview displays GPU allocation

- **WHEN** user views the memory scale factor preview
- **THEN** GPU allocation is calculated as `total_gpu_memory * gpu_scale_factor`

#### Scenario: Memory preview displays RAM allocation

- **WHEN** user views the memory scale factor preview
- **THEN** RAM allocation is calculated as `total_ram_memory * ram_scale_factor`

## REMOVED Requirements

### Requirement: Separate Memory Query

The system no longer provides a separate `useMemoryQuery()` hook - memory data is now consolidated into the config endpoint.
