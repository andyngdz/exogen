# Branding Capability

## ADDED Requirements

### Requirement: Product Identity

The application SHALL be identified as "ExoGen" in all user-facing contexts.

#### Scenario: Application title displays ExoGen

- **WHEN** the application is loaded
- **THEN** the browser/window title displays "ExoGen"

#### Scenario: Footer displays ExoGen copyright

- **WHEN** the user views the application footer
- **THEN** the copyright text includes "ExoGen"

#### Scenario: Logo alt text references ExoGen

- **WHEN** the application logo is rendered
- **THEN** the alt text reads "ExoGen Logo"

### Requirement: Backend Identity

The backend service SHALL be identified as "ExoGen Backend" in all status messages and logs.

#### Scenario: Backend starting message

- **WHEN** the backend service is starting
- **THEN** the status message reads "Starting ExoGen Backend on port {port}"

#### Scenario: Backend started message

- **WHEN** the backend service has started
- **THEN** the status message reads "ExoGen Backend is starting"

#### Scenario: Backend error message

- **WHEN** the backend service fails to start
- **THEN** the error message reads "Failed to start ExoGen Backend"

### Requirement: Health Check Identity

The health check UI SHALL reference "ExoGen" when describing the backend connection.

#### Scenario: Health check description

- **WHEN** the health check is displayed
- **THEN** the description reads "Checking the connection to your ExoGen backend server"

### Requirement: GPU Detection Identity

The GPU detection UI SHALL reference "ExoGen" when describing CPU mode.

#### Scenario: CPU mode description

- **WHEN** CPU-only mode is detected
- **THEN** the description includes "ExoGen will run on CPU"

### Requirement: Repository References

All repository references SHALL point to the ExoGen repositories.

#### Scenario: Backend repository URL

- **WHEN** the backend is cloned
- **THEN** the repository URL is "https://github.com/andyngdz/exogen_backend.git"

#### Scenario: Backend directory name

- **WHEN** the backend is installed
- **THEN** the directory is named "exogen_backend"

### Requirement: Package Identity

The npm package SHALL be identified as "exogen".

#### Scenario: Package name

- **WHEN** the package.json is read
- **THEN** the name field is "exogen"

#### Scenario: Package description

- **WHEN** the package.json is read
- **THEN** the description field is "ExoGen"

### Requirement: Electron App Identity

The Electron application SHALL be identified with ExoGen branding.

#### Scenario: App ID

- **WHEN** the Electron app is built
- **THEN** the app ID is "dev.andyng.exogen"

#### Scenario: Product name

- **WHEN** the Electron app is built
- **THEN** the product name is "ExoGen"

#### Scenario: GitHub release repository

- **WHEN** auto-updates are configured
- **THEN** the repository is "exogen"
