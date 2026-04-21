# Log Streaming

## MODIFIED Requirements

### Requirement: Status Message Loading Indicator

The system SHALL display a loading spinner only on the most recent non-error backend status message to indicate the current activity in progress.

#### Scenario: Last info message shows spinner

- **WHEN** multiple backend status messages are displayed
- **AND** the most recent message has level "info"
- **THEN** a small loading spinner appears beside only the last message

#### Scenario: Previous messages show no spinner

- **WHEN** multiple backend status messages are displayed
- **THEN** all messages except the last one show no spinner

#### Scenario: Last error message shows no spinner

- **WHEN** the most recent backend status message has level "error"
- **THEN** no spinner is shown on any message

### Requirement: Accurate Startup Message

The system SHALL emit "ExoGen Backend is starting" (not "started successfully") when initiating the uvicorn process, reflecting that startup is in progress rather than complete.

#### Scenario: Backend startup message

- **WHEN** the backend uvicorn process is initiated
- **THEN** the status message reads "ExoGen Backend is starting"
