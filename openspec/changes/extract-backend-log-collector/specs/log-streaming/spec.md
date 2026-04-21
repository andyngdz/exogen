## ADDED Requirements

### Requirement: Immediate Log Collection

The system SHALL begin collecting backend logs immediately when the application starts, regardless of whether the log viewer UI is open.

#### Scenario: Logs captured before UI opens

- **WHEN** the application starts
- **AND** the user has not opened the console drawer
- **THEN** backend logs are still captured and stored

#### Scenario: Historical logs available on UI open

- **WHEN** the user opens the console drawer
- **THEN** all logs captured since app startup are visible

## MODIFIED Requirements

### Requirement: Real-Time Streaming

The system SHALL stream backend logs to frontend in real-time via a dedicated collector component mounted at the application root.

#### Scenario: Log appears on emission

- **WHEN** backend logs a message
- **THEN** the log is captured by the collector component within 100ms

#### Scenario: Collector runs at app root

- **WHEN** the application initializes
- **THEN** the log collector component is mounted and begins listening for log events
