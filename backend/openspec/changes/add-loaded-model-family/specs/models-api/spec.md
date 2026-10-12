## ADDED Requirements

### Requirement: Loaded Model Family

The system SHALL expose an authoritative family label for the currently loaded model, derived from the loaded diffusers pipeline.

The family label MUST be returned:
- As `loaded_model_family` in `GET /models/status` (always present)
- As `family` in the response for `POST /models/load`

The family label MUST be one of:
- `sd15`
- `sdxl`
- `sd2`
- `sd3`
- `flux`
- `unknown`

#### Scenario: Status reports unknown when no model is loaded
- **WHEN** `GET /models/status` is called while no model is loaded
- **THEN** the response contains `loaded_model_family` set to `unknown`

#### Scenario: Load response includes family
- **WHEN** `POST /models/load` completes successfully
- **THEN** the response includes a `family` field

#### Scenario: Status family matches loaded model
- **WHEN** a model is loaded successfully
- **AND** `GET /models/status` is called
- **THEN** `loaded_model_family` matches the loaded pipeline family
