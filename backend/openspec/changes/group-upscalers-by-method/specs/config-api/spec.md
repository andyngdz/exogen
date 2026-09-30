# config-api

## MODIFIED Requirements

### Requirement: Upscaler Options

The system SHALL return upscaler options grouped by method with section metadata.

#### Scenario: Upscaler sections structure

- **WHEN** config is fetched
- **THEN** response contains `upscalers` array of section objects
- **AND** each section contains `method` (enum value), `title` (display string), `options` (array of upscaler items)

#### Scenario: Traditional upscalers section

- **WHEN** config is fetched
- **THEN** a section with `method="traditional"` and `title="Traditional"` exists
- **AND** its `options` array contains Lanczos, Bicubic, Bilinear, Nearest upscalers

#### Scenario: AI upscalers section

- **WHEN** config is fetched
- **THEN** a section with `method="ai"` and `title="AI"` exists
- **AND** its `options` array contains RealESRGAN_x2plus, RealESRGAN_x4plus, RealESRGAN_x4plus_anime upscalers

#### Scenario: Upscaler item data

- **WHEN** config is fetched
- **THEN** each upscaler in `options` contains value, name, description, suggested_denoise_strength, method, is_recommended

#### Scenario: Recommended upscalers

- **WHEN** config is fetched
- **THEN** RealESRGAN upscalers (x2plus, x4plus, x4plus_anime) have is_recommended=true
- **AND** traditional upscalers (Lanczos, Bicubic, Bilinear, Nearest) have is_recommended=false

## REMOVED Requirements

### Requirement: Flat upscalers list

The flat `upscalers` array of items is replaced with `upscalers` array of grouped sections.

## Key Entities

- **UpscalerSection**: method (enum), title (string), options (list of UpscalerItem)
- **UpscalerItem**: value, name, description, suggested_denoise_strength, method, is_recommended
- **ConfigResponse**: upscalers (list of UpscalerSection)
