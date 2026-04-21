## ADDED Requirements

### Requirement: Backend Process Termination

The system SHALL terminate the backend Python process and all its child processes when the application quits, using the `tree-kill` package for cross-platform support.

#### Scenario: Windows process tree termination

- **GIVEN** the backend is running on Windows
- **WHEN** the application quits
- **THEN** the system uses `tree-kill` to terminate the entire process tree
- **AND** the terminal returns to the prompt within 5 seconds

#### Scenario: Unix/Linux/macOS process termination

- **GIVEN** the backend is running on Unix/Linux/macOS
- **WHEN** the application quits
- **THEN** the system uses `tree-kill` to send SIGTERM to the process tree

### Requirement: Graceful Shutdown Timeout

The system SHALL wait for the backend process to exit gracefully before force-killing it.

#### Scenario: Process termination via tree-kill

- **GIVEN** the backend is running
- **WHEN** termination is requested
- **THEN** the system uses `tree-kill` with SIGTERM signal
- **AND** the callback resolves when the process tree is terminated

### Requirement: Shutdown Error Handling

The system SHALL handle errors during backend shutdown gracefully without crashing the application.

#### Scenario: Process already terminated

- **GIVEN** the backend process has already exited
- **WHEN** stopBackend is called
- **THEN** the error is logged via console.error
- **AND** no exception is thrown

#### Scenario: Permission denied during kill

- **GIVEN** the system lacks permission to kill the process
- **WHEN** stopBackend is called
- **THEN** the error is logged
- **AND** the application continues to quit
