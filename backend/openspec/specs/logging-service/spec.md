# Logging Service

## Purpose

Structured logging with categories and colored output for debugging and monitoring.

## Requirements

### Requirement: Category-Based Logging

The system SHALL support category-based logging with mandatory category parameter.

#### Scenario: Log with category

- **WHEN** logging a message
- **THEN** category must be provided

#### Scenario: Filter by category

- **WHEN** reviewing logs
- **THEN** logs can be filtered by category

### Requirement: Log Levels

The system SHALL support standard log levels (DEBUG, INFO, WARNING, ERROR).

#### Scenario: Debug logging

- **WHEN** LOG_LEVEL=DEBUG
- **THEN** all log levels are shown

#### Scenario: Info logging

- **WHEN** LOG_LEVEL=INFO
- **THEN** DEBUG logs are hidden

### Requirement: Colored Output

The system SHALL display colored log output in terminal.

#### Scenario: Color by level

- **WHEN** logs are displayed
- **THEN** different levels have different colors

### Requirement: Module Loggers

The system SHALL create separate loggers per module.

#### Scenario: Module-specific logger

- **WHEN** a module logs
- **THEN** logger name includes module path

## Key Entities

- **LoggerService**: Main logging interface
- **LogCategory**: Enum of valid categories
