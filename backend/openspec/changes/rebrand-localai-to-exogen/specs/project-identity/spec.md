## ADDED Requirements

### Requirement: Project Identity

The project SHALL be named "Exogen Backend" across all configurations, documentation, and user-facing messages.

The following naming conventions SHALL be used:
- Package name: `exogen-backend` (kebab-case for package registries)
- Database file: `exogen_backend.db` (snake_case for filesystem)
- API title: `Exogen Backend`
- Repository: `exogen_backend` (snake_case for GitHub)

#### Scenario: User sees consistent branding
- **WHEN** a user interacts with the API health endpoint
- **THEN** the response message references "Exogen Backend"

#### Scenario: Developer installs package
- **WHEN** a developer installs the package
- **THEN** the package is named `exogen-backend`

#### Scenario: Application stores data
- **WHEN** the application initializes the database
- **THEN** the database file is named `exogen_backend.db`
