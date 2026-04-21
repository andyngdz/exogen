## MODIFIED Requirements

### Requirement: Centralized Store

The system SHALL store the fetched configuration in a centralized store accessible across all components.

#### Scenario: Config accessible via hook

- **WHEN** any component needs config data
- **THEN** it can access it through the `useConfig()` hook

#### Scenario: Safety check setting available

- **WHEN** config is loaded from backend
- **THEN** `safety_check_enabled` is available via `useConfig()` with default `true`

## ADDED Requirements

### Requirement: Safety Check Configuration Sync

The system SHALL sync the safety check setting with the backend when the user toggles it in General Settings.

#### Scenario: User enables safety check

- **WHEN** user toggles safety check ON in settings
- **THEN** a `PUT /config/safety-check` request is sent with `{ enabled: true }`
- **AND** the backend config cache is invalidated to refetch latest state

#### Scenario: User disables safety check

- **WHEN** user toggles safety check OFF in settings
- **THEN** a `PUT /config/safety-check` request is sent with `{ enabled: false }`
- **AND** the backend config cache is invalidated to refetch latest state

#### Scenario: Mutation does not fire on initial load

- **WHEN** settings form is initialized with persisted values
- **THEN** no mutation is sent to backend (only user interactions trigger sync)
