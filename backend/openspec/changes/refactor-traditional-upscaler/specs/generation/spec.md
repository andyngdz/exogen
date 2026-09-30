# Generation Module Structure

## MODIFIED Requirements

### Requirement: Traditional Upscaler Module

The system SHALL provide a dedicated module for traditional upscaling with optional refinement.

#### Scenario: Upscale with PIL interpolation

- **WHEN** traditional upscaler is used (Lanczos, Bicubic, etc.)
- **THEN** images are upscaled using PIL resampling methods

#### Scenario: Refine after upscaling

- **WHEN** refinement is requested for traditionally upscaled images
- **THEN** img2img pass adds detail and reduces upscaling blur

#### Scenario: Combined upscale and refine workflow

- **WHEN** hires fix requests traditional upscaling with refinement
- **THEN** traditional_upscaler handles both operations in sequence

### Requirement: Hires Fix as Orchestrator

The hires fix processor SHALL delegate specialized operations to dedicated modules.

#### Scenario: Traditional upscaling workflow

- **WHEN** traditional upscaler is selected for hires fix
- **THEN** hires_fix delegates to traditional_upscaler.upscale_and_refine()

#### Scenario: AI upscaling workflow

- **WHEN** AI upscaler (Real-ESRGAN) is selected for hires fix
- **THEN** hires_fix delegates to realesrgan_upscaler.upscale() and skips refinement
