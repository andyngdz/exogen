# Change: LoRA Frontend Integration

## Why

Users need to select and configure LoRA models to customize image generation with trained styles and characters.

## What Changes

- Add LoRA selection modal in Extra section
- Implement multiple LoRA selection with cards display
- Add weight adjustment slider (0.0-2.0, default 1.0)
- Support LoRA removal
- Persist selections to localStorage
- Include LoRAs in generation requests

## Impact

- Affected specs: lora-integration
- Affected code: LoRA modal component, Extra section, generation request handler
