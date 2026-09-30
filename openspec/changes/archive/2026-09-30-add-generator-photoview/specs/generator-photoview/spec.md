## ADDED Requirements

### Requirement: Open Photoview from Generated Preview

The system SHALL open a photoview modal when the user clicks a generated image preview tile.

#### Scenario: Open from grid view

- **WHEN** the user clicks a generated image tile in Grid view
- **THEN** the photoview modal opens showing that image

#### Scenario: Open from slider view

- **WHEN** the user clicks a generated image tile in Slider view
- **THEN** the photoview modal opens showing that image

### Requirement: Photoview Navigation

The system SHALL support navigation between generated images using left/right controls and keyboard.

#### Scenario: Navigate to next image

- **WHEN** the user navigates to the next image (right key or control)
- **THEN** the next generated image is displayed

#### Scenario: Navigate to previous image

- **WHEN** the user navigates to the previous image (left key or control)
- **THEN** the previous generated image is displayed

### Requirement: Continuous Loop

The system SHALL loop navigation continuously when multiple generated images exist.

#### Scenario: Loop from last to first

- **WHEN** the user is at the last image and navigates next
- **THEN** the first image is displayed

#### Scenario: Loop from first to last

- **WHEN** the user is at the first image and navigates previous
- **THEN** the last image is displayed

### Requirement: Photoview Display

The system SHALL display the current generated image in a large view optimized for inspection.

#### Scenario: Contain fit

- **WHEN** the photoview shows an image
- **THEN** the image is rendered with a contain fit (no cropping)

### Requirement: Use as Image-to-Image Input

The photoview SHALL allow sending the currently viewed generated image to Image-to-Image input.

#### Scenario: Use as input

- **WHEN** the user clicks "Use as input" in photoview
- **THEN** the system sets Image-to-Image init image to the currently viewed image
- **AND** the generator mode switches to Image-to-Image
- **AND** the photoview closes
