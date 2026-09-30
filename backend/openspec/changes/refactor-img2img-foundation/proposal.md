# Proposal: Refactor Img2Img Foundation

## Change ID

`refactor-img2img-foundation`

## Summary

Refactor the `app/features/img2img` module to align its architecture with the `app/features/generators` (text-to-image) service. This establishes a modular foundation, enabling missing capabilities such as LoRA support, real-time phase tracking (for UI progress), and robust safety checker integration.

## Motivation

1.  **Architecture Parity**: The current `img2img` implementation is monolithic and diverges from the modular pattern established in `generators` (txt2img). This makes maintenance difficult and features inconsistent.
2.  **Missing Features**: Img2Img currently lacks:
    -   **LoRA Support**: Users cannot apply Low-Rank Adaptation models to img2img generations.
    -   **Phase Tracking**: The UI cannot show detailed progress steps (e.g., "Decoding", "Upscaling") because the service doesn't emit these events.
    -   **Safety Checker**: It does not utilize the centralized `SafetyCheckerService`, leading to potential inconsistencies in NSFW handling.
3.  **Foundation for Future**: A robust foundation is required for advanced features like Inpainting or ControlNet which will build upon this pipeline.

## Scope

**In scope:**
-   Update `Img2ImgConfig` schema to include `loras` and `clip_skip`.
-   Create `BaseImg2Img` class in `app/features/img2img/base_img2img.py` to encapsulate the core generation loop (similar to `BaseGenerator`).
-   Refactor `Img2ImgService` in `app/features/img2img/service.py` to act as an orchestrator using `BaseImg2Img`.
-   Implement `config_validator.py` for img2img specific validation.
-   Integrate existing core services: `SafetyCheckerService`, `GenerationPhaseTracker`, and `LoRALoader`.
-   Update unit tests in `tests/app/features/img2img/`.

**Out of scope:**
-   Changes to Text-to-Image generation.
-   Implementation of Inpainting (future work).
-   Frontend UI changes (backend only, though UI will benefit from better progress events).

## Design Overview

### Schema Changes
Update `Img2ImgConfig` in `app/schemas/img2img.py`:
```python
class Img2ImgConfig(BaseModel):
    # ... existing fields ...
    loras: list[LoRAConfigItem] = Field(default_factory=list)
    clip_skip: int = Field(default=1)
```

### New Module Structure
```
app/features/img2img/
├── __init__.py
├── api.py                  # Router (unchanged mostly)
├── service.py              # Orchestrator (loads/unloads resources)
├── base_img2img.py         # NEW: Core generation logic (Pipeline execution)
├── config_validator.py     # NEW: Validation logic
└── ...
```

### Workflow
1.  **Service**: Validates config.
2.  **Service**: Loads LoRAs (via `lora_loader`).
3.  **Service**: Calls `BaseImg2Img.execute()`.
4.  **BaseImg2Img**:
    -   Initializes `GenerationPhaseTracker`.
    -   Sets samplers/seeds.
    -   Executes Pipeline.
    -   Decodes Latents.
    -   Calls `SafetyCheckerService`.
    -   Applies Hires Fix (if configured).
    -   Emits completion.
5.  **Service**: Unloads LoRAs and cleans up.

## Impact Analysis

### Dependencies
-   `app/schemas/img2img.py` will be modified.
-   Existing API consumers will see new optional fields (`loras`, `clip_skip`).

### Risks
-   **Regression**: potential breakage of existing img2img functionality.
    -   *Mitigation*: Comprehensive unit tests mocking the pipeline and verifying all steps.
-   **Memory Usage**: LoRA loading adds memory overhead.
    -   *Mitigation*: Ensure `unload_loras` is called in `finally` block (same as Txt2Img).

## Success Criteria

1.  `Img2ImgService` successfully runs with valid LoRA configurations.
2.  Socket events (`generation_phase`) are emitted during img2img generation.
3.  Safety Checker correctly flags/filters NSFW content in img2img results.
4.  Existing tests pass (after updates).
5.  New tests cover the `BaseImg2Img` class and orchestration logic.
