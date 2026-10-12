## ADDED Requirements

### Requirement: Safety Checker Type Compatibility

The system SHALL convert PIL images to numpy arrays before passing to the diffusers safety checker and convert results back to PIL images, ensuring compatibility with the diffusers library's expected input format.

#### Scenario: NSFW content detected during generation

- **WHEN** the safety checker detects NSFW content in generated images
- **THEN** the system SHALL return black images without crashing
- **AND** the nsfw_detected list SHALL indicate which images were flagged

#### Scenario: Safe content passes through unchanged

- **WHEN** the safety checker does not detect NSFW content
- **THEN** the system SHALL return the original images unchanged as PIL Images
- **AND** the nsfw_detected list SHALL contain False for all images
