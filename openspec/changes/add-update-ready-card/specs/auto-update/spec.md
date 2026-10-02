## MODIFIED Requirements

### Requirement: Install and Restart

The system SHALL show a downloaded update in Settings > Updates and let the user install it from there, without a native dialog.

#### Scenario: Update downloaded

- **WHEN** an update finishes downloading
- **THEN** Settings > Updates shows "ExoGen <version> is ready to install" with Later and Install and restart
- **AND** a dot appears on the Settings rail icon and on the Updates nav item
- **AND** no native dialog opens

#### Scenario: Install after download

- **WHEN** the user clicks Install and restart
- **THEN** the app restarts with the new version

#### Scenario: Later

- **WHEN** the user clicks Later
- **THEN** the card and both dots stay hidden until the next launch
- **AND** the update still installs when the app quits

#### Scenario: Settings opened after the download

- **WHEN** the update finished downloading before Settings was opened
- **THEN** Settings > Updates still shows the ready card

### Requirement: Manual Update Check

The system SHALL allow users to manually check for updates from settings and show when the last check ran.

#### Scenario: Manual check from settings

- **WHEN** user clicks "Check for updates" in settings
- **THEN** the app checks for and displays available updates

#### Scenario: Last check time

- **WHEN** the app has checked for updates at least once this session
- **THEN** Settings > Updates shows "Last checked at" with the time of that check
