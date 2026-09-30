## ADDED Requirements

### Requirement: Generator Mode Tabs

The generator UI SHALL provide a mode switch with two options: Text-to-Image and Image-to-Image.

#### Scenario: Default mode is Text-to-Image

- **WHEN** the generator page is opened
- **THEN** the mode tabs show Text-to-Image as active
- **AND** the Text-to-Image middle panel is rendered

#### Scenario: Switch to Image-to-Image

- **WHEN** the user selects the Image-to-Image tab
- **THEN** the Image-to-Image middle panel is rendered

#### Scenario: Switch back to Text-to-Image

- **WHEN** the user selects the Text-to-Image tab
- **THEN** the Text-to-Image middle panel is rendered
- **AND** any selected Image-to-Image input image is cleared from memory

### Requirement: Shared Prompt Inputs

Both modes SHALL use the same prompt and negative prompt input UI.

#### Scenario: Prompts are editable in both modes

- **WHEN** the user switches between Text-to-Image and Image-to-Image
- **THEN** the prompt inputs remain available and editable

### Requirement: Image Input Selection

The Image-to-Image UI SHALL allow the user to select an input image and show a preview.

#### Scenario: Select image via file picker

- **WHEN** the user selects an image from the file picker
- **THEN** the UI stores the image as base64 in ephemeral state
- **AND** a preview of the image is displayed

#### Scenario: Select image via drag and drop

- **WHEN** the user drops an image onto the Image-to-Image dropzone
- **THEN** the UI stores the image as base64 in ephemeral state

#### Scenario: Remove selected image

- **WHEN** the user clicks remove on the image preview
- **THEN** the stored input image is cleared

### Requirement: Img2Img Parameters

The Image-to-Image UI SHALL allow configuration of img2img-specific parameters and send them to the backend.

#### Scenario: Configure strength

- **WHEN** the user adjusts the "Denoising Strength" control
- **THEN** the generation request uses the configured `strength` value

#### Scenario: Configure resize mode

- **WHEN** the user selects a resize mode
- **THEN** the generation request uses `resize_mode` set to one of: `resize`, `crop`

### Requirement: Dedicated Generation Hooks

The system SHALL use distinct generation flows for Text-to-Image and Image-to-Image.

#### Scenario: Generate via Text-to-Image

- **WHEN** the user clicks Generate in Text-to-Image mode
- **THEN** the client calls the Text-to-Image API (`POST /generators`)

#### Scenario: Generate via Image-to-Image

- **WHEN** the user clicks Generate in Image-to-Image mode
- **THEN** the client calls the Image-to-Image API (`POST /img2img`)

### Requirement: Sidebar Mode Awareness

The left configuration panel SHALL adjust to avoid conflicting controls between modes.

#### Scenario: Hires.fix is not shown in Image-to-Image

- **WHEN** Image-to-Image mode is active
- **THEN** the Hires.fix controls are hidden or disabled

#### Scenario: Img2Img config section is shown in Image-to-Image

- **WHEN** Image-to-Image mode is active
- **THEN** the img2img config section (strength and resize mode) is visible
