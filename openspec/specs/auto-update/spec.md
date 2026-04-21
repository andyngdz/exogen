# Auto-Update

## Purpose

Automatic update detection, download, and installation for the ExoGen desktop application.

## Requirements

### Requirement: Automatic Update Check

The system SHALL check for updates on app start with a 5-second delay to avoid blocking startup.

#### Scenario: Update available on startup

- **WHEN** the app starts and a new version is available
- **THEN** the user sees an update notification

#### Scenario: No update available

- **WHEN** the app starts and the current version is latest
- **THEN** no notification is shown

### Requirement: Background Download

The system SHALL download updates in the background with progress tracking.

#### Scenario: Download with progress

- **WHEN** the user clicks download on the update notification
- **THEN** the update downloads in the background with visible progress

### Requirement: Install and Restart

The system SHALL prompt the user to restart and install after download completes.

#### Scenario: Install after download

- **WHEN** the update is downloaded and user clicks install
- **THEN** the app restarts with the new version

### Requirement: Data Preservation

The system SHALL preserve user data during updates.

#### Scenario: User data survives update

- **WHEN** an update is installed
- **THEN** all user data and settings are preserved

### Requirement: Cross-Platform Support

The system SHALL support auto-update on Windows (NSIS), macOS (DMG), and Linux (AppImage).

#### Scenario: Platform-specific update

- **WHEN** an update is available on any supported platform
- **THEN** the appropriate installer format is used

### Requirement: Manual Update Check

The system SHALL allow users to manually check for updates from settings.

#### Scenario: Manual check from settings

- **WHEN** user clicks "Check for Updates" in settings
- **THEN** the app checks for and displays available updates

## Key Entities

- **UpdateInfo**: version, releaseNotes, updateAvailable, downloading, progress
- **Platforms**: Windows (NSIS), macOS (DMG), Linux (AppImage)
