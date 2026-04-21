# Feature Specification: LoRA Frontend Integration

**Feature Branch**: `008-lora-integration` (historical - already merged)
**Created**: 2024-11
**Status**: Completed

## User Scenarios & Testing

### User Story 1 - Select LoRAs for Generation (Priority: P1)

As a user, I want to select LoRAs to apply during image generation so I can customize my outputs with trained styles/characters.

**Why this priority**: Core feature for advanced generation customization.

**Acceptance Scenarios**:

1. **Given** I click the + button in Extra section, **When** modal opens, **Then** I see available LoRAs
2. **Given** I click a LoRA, **When** selection completes, **Then** it appears as a card in the Extra section
3. **Given** I generate an image, **When** request is sent, **Then** selected LoRAs are included

### User Story 2 - Adjust LoRA Weight (Priority: P2)

As a user, I want to adjust LoRA weights so I can control how strongly each LoRA affects the generation.

**Why this priority**: Fine-grained control over LoRA influence.

**Acceptance Scenarios**:

1. **Given** a LoRA is selected, **When** I adjust the slider, **Then** weight updates (0.0-2.0)
2. **Given** I set a weight, **When** I generate, **Then** the weight is sent with the request

### User Story 3 - Remove LoRAs (Priority: P3)

As a user, I want to remove selected LoRAs so I can change my configuration.

**Why this priority**: Essential for editing selections.

**Acceptance Scenarios**:

1. **Given** a LoRA card is displayed, **When** I click X button, **Then** the LoRA is removed
2. **Given** I remove a LoRA, **When** I generate, **Then** it's not included in request

### Edge Cases

- No LoRAs available: Show empty state in modal
- Multiple LoRAs: All display correctly in Extra section
- Page refresh: Selections persist via localStorage
- LoRA deleted from backend: Handle gracefully

## Requirements

### Functional Requirements

- **FR-001**: System MUST display available LoRAs in Extra modal
- **FR-002**: System MUST allow selecting multiple LoRAs
- **FR-003**: System MUST display selected LoRAs as cards with weight sliders
- **FR-004**: System MUST support weight adjustment (0.0-2.0, default 1.0)
- **FR-005**: System MUST allow removing selected LoRAs
- **FR-006**: System MUST persist selections to localStorage
- **FR-007**: System MUST include LoRAs in generation request

### Key Entities

- **LoRA**: id, name, file_path, file_size, created_at, updated_at
- **LoRAConfigItem**: lora_id, weight

## Success Criteria

### Measurable Outcomes

- **SC-001**: LoRA list loads within 1 second of opening modal
- **SC-002**: Selected LoRAs appear immediately as cards
- **SC-003**: Weight slider updates in real-time with 0.01 precision
- **SC-004**: Selections persist across page refreshes
- **SC-005**: Generation requests include correct lora_id and weight values
