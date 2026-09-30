# Config API - Spec Delta

## MODIFIED Requirements

### Requirement: Upscaler Options

The system SHALL return upscaler options with metadata including recommendation status.

#### Scenario: Upscaler data

- **WHEN** config is fetched
- **THEN** upscalers array contains value, name, description, suggested_denoise_strength, method, is_recommended

#### Scenario: Recommended upscalers

- **WHEN** config is fetched
- **THEN** RealESRGAN upscalers (x2plus, x4plus, x4plus_anime) have is_recommended=true
- **AND** traditional upscalers (Lanczos, Bicubic, Bilinear, Nearest) have is_recommended=false

## MODIFIED Key Entities

- **UpscalerItem**: value, name, description, suggested_denoise_strength, method, is_recommended
