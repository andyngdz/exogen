# AI Upscaler

## REMOVED Requirements

### Requirement: Face Enhancement

The system SHALL support optional GFPGAN face enhancement during upscaling.

#### Scenario: Face enhance enabled

- **WHEN** is_face_enhance=True and AI upscaler is used
- **THEN** GFPGAN is applied to enhance faces in upscaled image

#### Scenario: Face enhance disabled

- **WHEN** is_face_enhance=False
- **THEN** no face enhancement is applied

## MODIFIED Key Entities

- **HiresFixConfig.is_face_enhance**: ~~Optional face enhancement flag~~ REMOVED
