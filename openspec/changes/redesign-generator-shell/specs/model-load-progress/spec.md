## MODIFIED Requirements

### Requirement: Progress Bar Display

The system SHALL display model loading progress in the generator's model button and on the preview stage.

#### Scenario: Progress bar appears on load start

- **WHEN** model loading starts
- **THEN** the model button shows a spinner, the model name and the percent
- **AND** the stage shows the model name, a progress bar and the percent over the last preview

#### Scenario: Progress bar disappears on completion

- **WHEN** model loading completes
- **THEN** the model button returns to the loaded model name and family
- **AND** the stage loading panel disappears
- **AND** no full-screen loader covers the generator at any point of the load
