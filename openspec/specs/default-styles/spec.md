# Default Styles

## Purpose

Automatic application of default styles for new users.

## Requirements

### Requirement: First Visit Application

The system SHALL apply default styles (`fooocus_masterpiece`, `fooocus_negative`) on first visit when styles array is empty.

#### Scenario: Defaults applied on first visit

- **WHEN** a new user visits with empty styles
- **THEN** default styles are automatically applied

#### Scenario: No changes if styles exist

- **WHEN** user already has styles selected
- **THEN** no changes are made to their selection

### Requirement: One-Time Application

The system SHALL persist "applied" status in localStorage to ensure defaults are only applied once.

#### Scenario: Applied status persists

- **WHEN** defaults have been applied
- **THEN** the "applied" status survives browser refresh

#### Scenario: No re-application

- **WHEN** defaults were applied before
- **THEN** defaults are NOT re-applied on subsequent visits

### Requirement: Respect Manual Clearing

The system SHALL respect user's manual clearing and not re-apply defaults.

#### Scenario: Manual clear respected

- **WHEN** user clears all styles manually
- **THEN** defaults are NOT re-applied on page reload

### Requirement: Missing Styles Handling

The system SHALL skip missing default styles silently without errors.

#### Scenario: Missing style skipped

- **WHEN** a default style is not in the API response
- **THEN** it is skipped silently without errors

## Key Entities

- **DEFAULT_STYLE_IDS**: Array of default style IDs to apply
- **DEFAULTS_APPLIED_STORAGE_KEY**: localStorage key for tracking application status
