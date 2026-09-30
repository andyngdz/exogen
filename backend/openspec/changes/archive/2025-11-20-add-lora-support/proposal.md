# Change: Add LoRA Support

## Why
Users need to apply LoRA (Low-Rank Adaptation) weights to customize image generation styles.

## What Changes
- Added POST /loras/upload endpoint for uploading .safetensors files
- Implemented LoRA application during generation with weights 0.0-2.0
- Support for 1-5 LoRAs per generation
- Added GET /loras and DELETE /loras/{id} for management
- Automatic LoRA unloading after generation

## Impact
- Affected code: `app/features/loras/`, `app/schemas/lora.py`
- New database entity: LoRA with id, name, file_path, file_size, created_at
