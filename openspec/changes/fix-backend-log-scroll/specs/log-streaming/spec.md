## MODIFIED Requirements

### Requirement: Real-Time Streaming

The system SHALL stream backend logs to frontend in real-time.

#### Scenario: Log appears on emission

- **WHEN** backend logs a message
- **THEN** the log appears in frontend within 100ms

#### Scenario: Auto-scroll to latest log

- **WHEN** the log drawer is opened or a new log is added
- **THEN** the log list scrolls to show the most recent entry using virtualizer's scrollToIndex API
