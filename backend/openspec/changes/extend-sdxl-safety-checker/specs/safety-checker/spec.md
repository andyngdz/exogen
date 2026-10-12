# Safety Checker

## Purpose

NSFW content detection for generated images across all model types.

## ADDED Requirements

### Requirement: Universal Safety Check

The system SHALL run NSFW detection on generated images regardless of model type (SD 1.5, SDXL, SD3).

#### Scenario: SDXL image safety check

- **WHEN** an image is generated using SDXL model
- **AND** safety check is enabled
- **THEN** the safety checker SHALL analyze the image for NSFW content
- **AND** return nsfw_detected flag

#### Scenario: SD 1.5 image safety check

- **WHEN** an image is generated using SD 1.5 model
- **AND** safety check is enabled
- **THEN** the safety checker SHALL analyze the image for NSFW content
- **AND** return nsfw_detected flag

### Requirement: Standalone Safety Checker

The system SHALL use a standalone safety checker service, not attached to pipelines.

#### Scenario: Safety checker loads on demand

- **WHEN** safety_check_enabled is true
- **AND** generation starts
- **THEN** the safety checker model SHALL be loaded from CompVis/stable-diffusion-safety-checker
- **AND** the feature extractor SHALL be loaded from openai/clip-vit-base-patch32

#### Scenario: Safety checker unloads after use

- **WHEN** safety check completes
- **THEN** the safety checker model SHALL be unloaded from memory
- **AND** GPU cache SHALL be cleared to free VRAM

#### Scenario: No loading when disabled

- **WHEN** safety_check_enabled is false
- **THEN** the safety checker SHALL NOT be loaded
- **AND** no memory SHALL be consumed by safety checker

#### Scenario: No diffusers warnings

- **WHEN** loading any pipeline (SD 1.5, SDXL, SD3)
- **THEN** no safety_checker parameter SHALL be passed to the pipeline
- **AND** no diffusers warnings about safety_checker SHALL occur

### Requirement: NSFW Image Handling

The system SHALL black out images when NSFW content is detected.

#### Scenario: NSFW content detected

- **WHEN** the safety checker detects NSFW content
- **THEN** the affected image SHALL be replaced with a black image
- **AND** nsfw_detected SHALL be true for that image
- **AND** a warning SHALL be logged

#### Scenario: Safe content passes through

- **WHEN** the safety checker does not detect NSFW content
- **THEN** the original image SHALL be returned unchanged
- **AND** nsfw_detected SHALL be false for that image

### Requirement: Safety Check Toggle

The system SHALL respect the global safety_check_enabled setting.

#### Scenario: Safety check disabled

- **WHEN** safety_check_enabled is false in database
- **THEN** the safety checker SHALL NOT be loaded
- **AND** nsfw_detected SHALL return [false] for all images
- **AND** original images SHALL be returned unchanged

#### Scenario: Encapsulated database access

- **WHEN** check_images is called
- **THEN** the service SHALL read safety_check_enabled from database internally
- **AND** callers SHALL NOT need to check the setting themselves

## Key Entities

- **SafetyCheckerService**: Singleton service managing safety checker lifecycle
- **StableDiffusionSafetyChecker**: HuggingFace model for NSFW detection
- **CLIPImageProcessor**: Feature extractor for safety checker input
