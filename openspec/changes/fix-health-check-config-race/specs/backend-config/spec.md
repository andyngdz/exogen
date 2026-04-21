## MODIFIED Requirements

### Requirement: Null-Safe Config Hook

The system SHALL provide a `useConfig()` wrapper hook that returns config with default empty arrays and loading state, eliminating null-checking in consuming components.

#### Scenario: Empty array defaults

- **WHEN** config is not yet loaded
- **THEN** `useConfig()` returns `{ upscalers: [], isLoading: true }`

#### Scenario: Loading state exposed

- **WHEN** config query is in progress
- **THEN** `useConfig()` returns `isLoading: true`

#### Scenario: Loading complete

- **WHEN** config query completes successfully
- **THEN** `useConfig()` returns `isLoading: false` with populated data

## ADDED Requirements

### Requirement: Device Configuration Status

The system SHALL provide an `isHasDevice` boolean in the `useConfig()` hook indicating whether a GPU device has been configured.

#### Scenario: Device configured

- **WHEN** `device_index` is a valid device index (>= 0)
- **THEN** `isHasDevice` returns `true`

#### Scenario: Device not configured

- **WHEN** `device_index` equals `DeviceSelection.NOT_FOUND` (-2)
- **THEN** `isHasDevice` returns `false`

#### Scenario: Config still loading

- **WHEN** config query is still loading
- **THEN** `isHasDevice` returns `false` (default value)
