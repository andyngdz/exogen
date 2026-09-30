## ADDED Requirements

### Requirement: Decoupled Hires Fix Request
The hires fix processor SHALL accept a dedicated request schema that contains all inputs needed for upscaling and optional refinement.

#### Scenario: Final prompts are used for refinement
- **WHEN** hires fix performs an img2img refinement pass
- **THEN** the system uses the final processed prompts provided in the request (after style application)
