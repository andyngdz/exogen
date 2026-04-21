# Backend Configuration

## MODIFIED Requirements

### Requirement: Upscaler Configuration

The system SHALL consume upscaler configuration as an array of sections, each containing method, title, and options.

#### Scenario: Upscaler sections from API

- **WHEN** backend config is loaded
- **THEN** `upscalers` contains an array of sections with `method`, `title`, and `options`

#### Scenario: Dynamic section rendering

- **WHEN** user opens the hires fix upscaler dropdown
- **THEN** sections are rendered dynamically based on the API response

#### Scenario: Upscaler selection across sections

- **WHEN** user selects an upscaler from any section
- **THEN** the system finds and applies the correct suggested_denoise_strength

## MODIFIED Key Entities

- **UpscalerOption**: value, name, description, suggested_denoise_strength, method, is_recommended
- **UpscalerSection**: method, title, options (array of UpscalerOption)
- **BackendConfig.upscalers**: array of UpscalerSection
