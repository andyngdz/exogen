# LoRA Support

## Purpose

Backend support for LoRA (Low-Rank Adaptation) weights in image generation.

## Requirements

### Requirement: LoRA Upload

The system SHALL support uploading LoRA files via POST /loras/upload.

#### Scenario: Upload valid LoRA

- **WHEN** valid .safetensors file is uploaded
- **THEN** file is copied to .cache/loras/ and registered in database

#### Scenario: Reject invalid format

- **WHEN** non-.safetensors file is uploaded
- **THEN** request is rejected with error

#### Scenario: Handle duplicates

- **WHEN** duplicate filename is uploaded
- **THEN** system handles gracefully (rename or error)

### Requirement: LoRA Application

The system SHALL apply LoRAs during generation with configurable weights.

#### Scenario: Apply single LoRA

- **WHEN** generation includes one LoRA
- **THEN** LoRA is loaded and applied to pipeline

#### Scenario: Apply multiple LoRAs

- **WHEN** generation includes multiple LoRAs
- **THEN** all LoRAs are combined with specified weights

#### Scenario: Weight range

- **WHEN** LoRA weight is specified
- **THEN** weight is between 0.0 and 2.0

### Requirement: LoRA Cleanup

The system SHALL unload LoRAs after each generation.

#### Scenario: Unload after generation

- **WHEN** generation completes
- **THEN** LoRAs are unloaded from memory

#### Scenario: Cleanup on error

- **WHEN** generation fails
- **THEN** LoRAs are still cleaned up

### Requirement: LoRA Management

The system SHALL support listing and deleting LoRAs.

#### Scenario: List LoRAs

- **WHEN** GET /loras is called
- **THEN** all registered LoRAs are returned with metadata

#### Scenario: Delete LoRA

- **WHEN** DELETE /loras/{id} is called
- **THEN** file and database entry are removed

### Requirement: Database ID Naming

The system SHALL use database ID for adapter names.

#### Scenario: Adapter naming

- **WHEN** LoRA is loaded
- **THEN** adapter name is the database ID

## Key Entities

- **LoRA**: id, name, file_path, file_size, created_at
- **LoRAConfigItem**: lora_id, weight (0.0-2.0)
