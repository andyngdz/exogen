## REMOVED Requirements

### Requirement: LoRA Selection Modal

**Reason**: LoRA selection moves from the Extra modal into the inspector's LoRA tab.

**Migration**: Open the LoRA tab in the generator inspector.

## ADDED Requirements

### Requirement: LoRA Tab

The system SHALL list available LoRAs in the inspector's LoRA tab, under a Library heading, with an upload action.

#### Scenario: Open the LoRA tab

- **WHEN** the user selects the LoRA tab in the inspector
- **THEN** the Library lists the available LoRAs with an add action for each

#### Scenario: Empty library

- **WHEN** no LoRAs are available
- **THEN** the Library shows an empty state message and the upload action

## MODIFIED Requirements

### Requirement: Multiple LoRA Selection

The system SHALL allow selecting multiple LoRAs for generation.

#### Scenario: Select a LoRA

- **WHEN** the user adds a LoRA from the Library in the LoRA tab
- **THEN** it appears as a card under Active in the LoRA tab

#### Scenario: Select multiple LoRAs

- **WHEN** the user adds multiple LoRAs
- **THEN** all selected LoRAs display as cards under Active
