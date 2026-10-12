## MODIFIED Requirements

### Requirement: Generator Mode Tabs

The generator UI SHALL provide a mode switch in the generator top bar with two options: Text-to-Image and Image-to-Image.

#### Scenario: Default mode is Text-to-Image

- **WHEN** the generator page is opened
- **THEN** the top bar switch shows Text-to-Image as active
- **AND** the stage shows the output preview without an input image

#### Scenario: Switch to Image-to-Image

- **WHEN** the user selects Image-to-Image in the top bar
- **THEN** the stage shows the input image area to the left of the output

#### Scenario: Switch back to Text-to-Image

- **WHEN** the user selects Text-to-Image in the top bar
- **THEN** the stage shows the output preview without an input image
- **AND** any selected Image-to-Image input image is cleared from memory

## REMOVED Requirements

### Requirement: Sidebar Mode Awareness

**Reason**: The left configuration panel is replaced by the inspector. Hires fix was never hidden in Image-to-Image, and the backend accepts `hires_fix` on `POST /img2img`, so it stays available in both modes.

**Migration**: See "Inspector Mode Awareness".

## ADDED Requirements

### Requirement: Inspector Mode Awareness

The inspector SHALL show the img2img section only in Image-to-Image mode and keep hires fix available in both modes.

#### Scenario: Img2Img section in Image-to-Image

- **WHEN** Image-to-Image mode is active
- **THEN** the Basic tab shows denoising strength and resize mode above Size

#### Scenario: Img2Img section hidden in Text-to-Image

- **WHEN** Text-to-Image mode is active
- **THEN** the Basic tab does not show denoising strength or resize mode

#### Scenario: Hires fix in both modes

- **WHEN** either mode is active
- **THEN** the Hires tab and its switch are available
