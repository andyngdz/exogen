# Backend Configuration

## MODIFIED Requirements

### Requirement: Null-Safe Config Hook

The system SHALL provide a `useConfig()` wrapper hook that returns config with default empty arrays, eliminating null-checking in consuming components.

#### Scenario: Empty array defaults

- **WHEN** config is not yet loaded
- **THEN** `useConfig()` returns `{ upscalers: [], upscalerOptions: [] }`

#### Scenario: Flattened upscaler options

- **WHEN** config contains upscaler sections
- **THEN** `upscalerOptions` returns all options flattened from all sections

## MODIFIED Key Entities

- **ConfigResult**: upscalers (UpscalerSection[]), upscalerOptions (UpscalerOption[])
