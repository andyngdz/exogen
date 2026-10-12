# Config API

## MODIFIED Requirements

### Requirement: Upscaler Options

The system SHALL return upscaler options with metadata.

#### Scenario: Upscaler data

- **WHEN** config is fetched
- **THEN** upscalers array contains value, name, description, suggested_denoise_strength, and method

#### Scenario: All upscalers included

- **WHEN** config is fetched
- **THEN** PIL upscalers (Lanczos, Bicubic, Bilinear, Nearest) and Real-ESRGAN upscalers (x2plus, x4plus, x4plus_anime) are included

#### Scenario: Upscaling method indicator

- **WHEN** config is fetched
- **THEN** each upscaler has method field with UpscalingMethod enum value (TRADITIONAL or AI)
