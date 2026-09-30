# AI Upscaler

## ADDED Requirements

### Requirement: Real-ESRGAN Upscaling

The system SHALL support Real-ESRGAN AI upscaling with 4 model variants.

#### Scenario: Upscale with x2plus model

- **WHEN** UpscalerType.REALESRGAN_X2PLUS is selected
- **THEN** images are upscaled 2x using RealESRGAN_x2plus model

#### Scenario: Upscale with x4plus model

- **WHEN** UpscalerType.REALESRGAN_X4PLUS is selected
- **THEN** images are upscaled 4x using RealESRGAN_x4plus model

#### Scenario: Upscale with anime model

- **WHEN** UpscalerType.REALESRGAN_X4PLUS_ANIME is selected
- **THEN** images are upscaled 4x using RealESRGAN_x4plus_anime_6B model

### Requirement: Per-Request Model Loading

The system SHALL load Real-ESRGAN models per-request and unload after.

#### Scenario: Model downloaded from GitHub releases

- **WHEN** AI upscaling is requested for the first time
- **THEN** model weights are downloaded from GitHub releases using pypdl and cached locally

#### Scenario: Model loaded on demand

- **WHEN** AI upscaling is requested
- **THEN** model weights are loaded from cache before upscaling

#### Scenario: Model unloaded after use

- **WHEN** upscaling completes
- **THEN** model is deleted and GPU memory is freed

#### Scenario: Memory cleanup on error

- **WHEN** upscaling fails
- **THEN** model is still cleaned up to prevent memory leaks

### Requirement: Face Enhancement

The system SHALL support optional GFPGAN face enhancement during upscaling.

#### Scenario: Face enhance enabled

- **WHEN** is_face_enhance=True and AI upscaler is used
- **THEN** GFPGAN is applied to enhance faces in upscaled image

#### Scenario: Face enhance disabled

- **WHEN** is_face_enhance=False
- **THEN** no face enhancement is applied

### Requirement: Target Scale Matching

The system SHALL resize AI-upscaled images to match user's desired scale factor.

#### Scenario: Native scale matches target

- **WHEN** user requests 4x scale with x4plus model
- **THEN** AI upscaled image is returned without additional resize

#### Scenario: Target scale differs from native

- **WHEN** user requests 3x scale with x4plus model (native 4x)
- **THEN** AI upscales at 4x then resizes down to 3x using Lanczos

#### Scenario: Model selection by scale

- **WHEN** user requests scale ≤2x
- **THEN** x2plus model is used (if available for selected upscaler type)

### Requirement: Device Support

The system SHALL support CUDA, MPS, and CPU for AI upscaling.

#### Scenario: CUDA upscaling

- **WHEN** CUDA is available
- **THEN** Real-ESRGAN runs on GPU with half precision

#### Scenario: MPS upscaling

- **WHEN** MPS is available (Apple Silicon)
- **THEN** Real-ESRGAN runs on MPS with full precision

#### Scenario: CPU fallback

- **WHEN** no GPU is available
- **THEN** Real-ESRGAN runs on CPU

## Key Entities

- **RealESRGANUpscaler**: AI upscaler using Real-ESRGAN models
- **UpscalerType**: Enum with PIL and Real-ESRGAN upscaler options
- **HiresFixConfig.is_face_enhance**: Optional face enhancement flag
