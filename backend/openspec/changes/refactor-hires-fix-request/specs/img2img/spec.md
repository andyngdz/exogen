## ADDED Requirements

### Requirement: Img2Img Hires Fix
The system SHALL support optional hires fix during img2img generation.

#### Scenario: Apply hires fix to safe images
- **WHEN** an img2img request includes `hires_fix`
- **AND** at least one generated image is not flagged NSFW
- **THEN** the system applies hires fix only to the safe images
- **AND** the response preserves the original NSFW flags

#### Scenario: Skip hires fix when all images are NSFW
- **WHEN** an img2img request includes `hires_fix`
- **AND** all generated images are flagged NSFW
- **THEN** the system SHALL skip hires fix

#### Scenario: Emit upscaling phase
- **WHEN** an img2img request includes `hires_fix`
- **THEN** the system emits an `upscaling` phase event during processing
