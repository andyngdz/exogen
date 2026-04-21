# LoRA Integration

## Purpose

Frontend integration for selecting and configuring LoRA models in image generation.

## Requirements

### Requirement: LoRA Selection Modal

The system SHALL display available LoRAs in a modal when clicking the + button in Extra section.

#### Scenario: Open LoRA modal

- **WHEN** user clicks + button in Extra section
- **THEN** a modal opens showing available LoRAs

#### Scenario: Empty state

- **WHEN** no LoRAs are available
- **THEN** an empty state message is shown in modal

### Requirement: Multiple LoRA Selection

The system SHALL allow selecting multiple LoRAs for generation.

#### Scenario: Select a LoRA

- **WHEN** user clicks a LoRA in the modal
- **THEN** it appears as a card in the Extra section

#### Scenario: Select multiple LoRAs

- **WHEN** user selects multiple LoRAs
- **THEN** all selected LoRAs display as cards

### Requirement: Weight Adjustment

The system SHALL support weight adjustment for each selected LoRA (0.0-2.0, default 1.0).

#### Scenario: Adjust LoRA weight

- **WHEN** user adjusts the weight slider
- **THEN** weight updates with 0.01 precision

#### Scenario: Weight in generation request

- **WHEN** user generates an image
- **THEN** the weight value is sent with the request

### Requirement: LoRA Removal

The system SHALL allow removing selected LoRAs.

#### Scenario: Remove a LoRA

- **WHEN** user clicks X button on a LoRA card
- **THEN** the LoRA is removed from selection

#### Scenario: Removed LoRA not in request

- **WHEN** a LoRA is removed and user generates
- **THEN** the removed LoRA is not included in request

### Requirement: Selection Persistence

The system SHALL persist LoRA selections to localStorage.

#### Scenario: Selections survive refresh

- **WHEN** page is refreshed
- **THEN** LoRA selections are restored from localStorage

### Requirement: Include in Generation

The system SHALL include selected LoRAs in generation requests.

#### Scenario: LoRAs sent with request

- **WHEN** user generates an image with LoRAs selected
- **THEN** lora_id and weight values are included in the request

## Key Entities

- **LoRA**: id, name, file_path, file_size, created_at, updated_at
- **LoRAConfigItem**: lora_id, weight
