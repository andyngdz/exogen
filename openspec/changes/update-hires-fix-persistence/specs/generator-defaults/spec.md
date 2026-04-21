## MODIFIED Requirements

### Requirement: Hires Fix Default Configuration on Enable

The system SHALL provide default Hires Fix configuration values when a first-time user enables the feature and preserve user changes across enable/disable toggles.

#### Scenario: Default upscale factor on enable

- **WHEN** a user enables Hires Fix for the first time (no prior hires_fix value)
- **THEN** the upscale factor defaults to `2x` (UpscaleFactor.TWO)

#### Scenario: Default upscaler preference

- **WHEN** a user enables Hires Fix for the first time (no prior hires_fix value)
- **THEN** the upscaler defaults to `RealESRGAN_x2plus` (UpscalerType.REAL_ESRGAN_X2_PLUS) if available, otherwise the first available upscaler

#### Scenario: Automatic denoising and steps

- **WHEN** a user enables Hires Fix for the first time
- **THEN** denoising strength uses the backend-suggested value for the selected upscaler and steps default to `0` (automatic)

#### Scenario: Existing user preferences preserved

- **WHEN** a user has previously configured Hires Fix settings (localStorage or prior form value exists)
- **THEN** their saved values are used instead of the defaults

#### Scenario: Form remains collapsed by default

- **WHEN** the application loads
- **THEN** the Hires Fix form is collapsed (checkbox unchecked) and no hires_fix value is present in FORM_DEFAULT_VALUES

#### Scenario: Values persist across toggles

- **WHEN** a user disables Hires Fix and later re-enables it
- **THEN** their prior Hires Fix values remain intact (no unregister or reset), and defaults are not re-applied unless no stored values exist

#### Scenario: Disabled flag omits backend payload

- **WHEN** Hires Fix is disabled via an enable flag that is tracked outside the `hires_fix` form data
- **THEN** backend requests omit the `hires_fix` payload while keeping stored values available locally
