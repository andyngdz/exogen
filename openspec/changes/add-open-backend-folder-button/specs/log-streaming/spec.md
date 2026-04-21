## ADDED Requirements

### Requirement: Open Backend Folder

The system SHALL provide a button to open the backend folder in the system file explorer.

#### Scenario: User opens backend folder

- **WHEN** user clicks the open folder button in the Backend Logs drawer header
- **THEN** the system opens the backend folder (`{userData}/exogen_backend`) in the default file manager

#### Scenario: Button placement

- **WHEN** the Backend Logs drawer is open
- **THEN** an IconButton is visible next to the "Backend Logs" title
