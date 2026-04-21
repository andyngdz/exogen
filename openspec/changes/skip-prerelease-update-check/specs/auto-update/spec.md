## MODIFIED Requirements

### Requirement: Automatic Update Check

The system SHALL check for updates on app start with a 5-second delay to avoid blocking startup. The system SHALL skip the update check for pre-release versions (versions containing `-` such as `-beta`, `-alpha`, or `-rc`) since these versions do not have update metadata files available.

#### Scenario: Update available on startup

- **WHEN** the app starts and a new version is available
- **THEN** the user sees an update notification

#### Scenario: No update available

- **WHEN** the app starts and the current version is latest
- **THEN** no notification is shown

#### Scenario: Pre-release version skips update check

- **WHEN** the app starts with a pre-release version (e.g., `1.0.0-beta.1`)
- **THEN** the update check is skipped and logged
- **AND** no errors are thrown
