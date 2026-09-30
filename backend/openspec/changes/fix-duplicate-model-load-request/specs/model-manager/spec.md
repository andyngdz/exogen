## MODIFIED Requirements

### Requirement: Model Loading State Management

The model manager SHALL manage model loading states and handle concurrent load requests appropriately.

#### Scenario: Same model requested while already loading

- **WHEN** a load request is received for model "A"
- **AND** model "A" is already in the LOADING state
- **THEN** the system SHALL raise `DuplicateLoadRequestError`
- **AND** the API layer SHALL return HTTP 204 (No Content)
- **AND** the original load operation SHALL continue uninterrupted

#### Scenario: Different model requested while another is loading

- **WHEN** a load request is received for model "B"
- **AND** model "A" is currently in the LOADING state
- **THEN** the system SHALL cancel the load of model "A"
- **AND** the system SHALL proceed to load model "B"

#### Scenario: Same model requested when already loaded

- **WHEN** a load request is received for model "A"
- **AND** model "A" is already in the LOADED state
- **THEN** the system SHALL return the existing model configuration
- **AND** no reload SHALL occur
