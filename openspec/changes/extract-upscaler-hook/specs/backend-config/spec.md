# Backend Configuration

## ADDED Requirements

### Requirement: Upscaler Hook Separation

The system SHALL provide upscaler logic through a dedicated `useGeneratorConfigHiresFixUpscaler` hook separate from the presentation component.

#### Scenario: Hook provides grouped upscalers

- **WHEN** the hook is called
- **THEN** it returns upscalers grouped by method (traditional and AI)

#### Scenario: Hook handles upscaler change

- **WHEN** an upscaler is selected
- **THEN** the hook updates the denoising strength to the upscaler's suggested value
