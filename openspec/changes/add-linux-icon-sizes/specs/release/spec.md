# Release

## MODIFIED Requirements

### Requirement: Linux Icon Configuration

The build system SHALL provide multiple icon sizes for Linux desktop integration.

#### Scenario: Icons directory structure

- **WHEN** the Linux application is built
- **THEN** the `build/icons/` directory contains PNG icons in sizes: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256, 512x512

#### Scenario: Icon naming convention

- **WHEN** icons are generated for Linux
- **THEN** each icon is named `{size}x{size}.png` (e.g., `16x16.png`, `512x512.png`)

#### Scenario: electron-builder configuration

- **WHEN** the Linux target is configured in electron-builder.yaml
- **THEN** the icon path points to `build/icons/` directory
