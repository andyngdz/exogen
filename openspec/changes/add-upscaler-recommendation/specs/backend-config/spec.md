# Backend Configuration

## MODIFIED Requirements

### Requirement: Upscaler Configuration

The system SHALL make upscaler configuration available with all fields (value, name, description, suggested_denoise_strength, method, is_recommended).

#### Scenario: Upscaler options in dropdown

- **WHEN** user opens the hires fix upscaler dropdown
- **THEN** options from backend config are displayed (traditional: Lanczos, Bicubic, Bilinear, Nearest; AI: Real-ESRGAN variants)

#### Scenario: Recommended upscalers indicated

- **WHEN** user opens the hires fix upscaler dropdown
- **THEN** upscalers with `is_recommended: true` display a "Recommended" chip

#### Scenario: Method categorization available

- **WHEN** upscaler config is loaded
- **THEN** each upscaler has a method field indicating `"traditional"` or `"ai"`

#### Scenario: Upscalers grouped by method

- **WHEN** user opens the hires fix upscaler dropdown
- **THEN** upscalers are grouped into sections by method ("Traditional" and "AI")

## MODIFIED Key Entities

- **UpscalerMethod** (enum): `TRADITIONAL = 'traditional'`, `AI = 'ai'`
- **Upscaler**: value (identifier), name (display name), description (help text), suggested_denoise_strength, method (UpscalerMethod enum), is_recommended (boolean)
