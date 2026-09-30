# Database Initialization

## ADDED Requirements

### Requirement: Auto Migration on Startup

The system SHALL automatically run Alembic migrations to head on application startup.

#### Scenario: Fresh database

- **WHEN** application starts with no existing database file
- **THEN** all migrations are applied and database is created at current schema version

#### Scenario: Existing database at head

- **WHEN** application starts with database already at latest migration
- **THEN** no migrations are applied and startup continues normally

#### Scenario: Existing database with pending migrations

- **WHEN** application starts with database behind latest migration
- **THEN** pending migrations are applied automatically

### Requirement: Migration Path Resolution

The system SHALL resolve the `alembic.ini` path relative to the module location, not the current working directory.

#### Scenario: Running from project root

- **WHEN** application runs from project root directory
- **THEN** `alembic.ini` is found and migrations execute successfully

#### Scenario: Running from different directory

- **WHEN** application runs from a different working directory (e.g., packaged Electron app)
- **THEN** `alembic.ini` is still found using module-relative path and migrations execute successfully

### Requirement: Migration Error Handling

The system SHALL fail fast with clear error messages if migrations cannot be applied.

#### Scenario: Migration failure

- **WHEN** a migration fails to apply
- **THEN** application startup is aborted with an error message indicating the failure
- **AND** the error includes enough context to debug the issue
