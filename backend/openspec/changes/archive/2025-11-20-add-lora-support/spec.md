# Feature Specification: Add LoRA Support

**Feature Branch**: `006-add-lora-support`
**Created**: 2024-11
**Status**: Completed

## User Scenarios & Testing

### User Story 1 - Upload LoRA (Priority: P1)

As a user, I want to add a LoRA from my filesystem so I can use it during image generation.

**Why this priority**: Core functionality - users need to add LoRAs before using them.

**Acceptance Scenarios**:

1. **Given** valid .safetensors file, **When** I upload via POST /loras/upload, **Then** file is copied to .cache/loras/ and registered
2. **Given** invalid file path, **When** I upload, **Then** I get clear error message
3. **Given** duplicate filename, **When** I upload, **Then** system handles gracefully

### User Story 2 - Generate with LoRAs (Priority: P1)

As a user, I want to apply 1-5 LoRAs with individual weights during generation so I can achieve specific styles.

**Acceptance Scenarios**:

1. **Given** registered LoRA, **When** I generate with lora_id and weight, **Then** LoRA is applied to output
2. **Given** multiple LoRAs, **When** I generate, **Then** all LoRAs are combined with specified weights
3. **Given** generation completes, **When** output is ready, **Then** LoRAs are unloaded from memory

### User Story 3 - Manage LoRAs (Priority: P2)

As a user, I want to list and delete LoRAs so I can manage my collection.

**Acceptance Scenarios**:

1. **Given** registered LoRAs, **When** I GET /loras, **Then** I see all LoRAs with metadata
2. **Given** LoRA exists, **When** I DELETE /loras/{id}, **Then** file and DB entry are removed

### Edge Cases

- File size limit (500MB)
- Invalid file format (not .safetensors)
- LoRA not found during generation
- Memory cleanup on error

## Requirements

### Functional Requirements

- **FR-001**: System MUST copy LoRA files to .cache/loras/
- **FR-002**: System MUST support .safetensors format only
- **FR-003**: System MUST support 1-5 LoRAs per generation with weights 0.0-2.0
- **FR-004**: System MUST unload LoRAs after each generation
- **FR-005**: System MUST use database ID for adapter names

### Key Entities

- **LoRA**: id, name, file_path, file_size, created_at
- **LoRAConfigItem**: lora_id, weight (0.0-2.0)

## Success Criteria

### Measurable Outcomes

- **SC-001**: LoRA upload/list/delete operations work correctly
- **SC-002**: Generation with multiple LoRAs produces expected output
- **SC-003**: Memory is cleaned up after generation
- **SC-004**: All tests pass (ruff, ty, pytest)
