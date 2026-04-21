# Log Streaming

## Purpose

Real-time backend log streaming to the frontend.

## Requirements

### Requirement: Real-Time Streaming

The system SHALL stream backend logs to frontend in real-time.

#### Scenario: Log appears on emission

- **WHEN** backend logs a message
- **THEN** the log appears in frontend within 100ms

### Requirement: Stream Controls

The system SHALL support start/stop/clear log controls.

#### Scenario: Start streaming

- **WHEN** user clicks start button
- **THEN** log streaming begins

#### Scenario: Stop streaming

- **WHEN** user clicks stop button
- **THEN** log streaming stops

#### Scenario: Clear logs

- **WHEN** user clicks clear button
- **THEN** all displayed logs are cleared instantly

### Requirement: Log Level Display

The system SHALL display log level (log, info, warn, error) with appropriate styling.

#### Scenario: Level-based styling

- **WHEN** a log entry is displayed
- **THEN** it shows the log level with appropriate color/style

### Requirement: Timestamp Display

The system SHALL include timestamp for each log entry.

#### Scenario: Entry with timestamp

- **WHEN** a log entry is displayed
- **THEN** it includes the timestamp

### Requirement: Status Indicator

The system SHALL provide a streaming status indicator.

#### Scenario: Active indicator

- **WHEN** streaming is active
- **THEN** indicator shows green

#### Scenario: Inactive indicator

- **WHEN** streaming is stopped
- **THEN** indicator shows red

## Key Entities

- **LogEntry**: level (log|info|warn|error), message, timestamp
- **LogLevel**: Enum of log, info, warn, error
