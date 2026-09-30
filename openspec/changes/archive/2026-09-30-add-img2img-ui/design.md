## Context

The generator UI currently implements a single Text-to-Image workflow with a form-backed config (`GeneratorConfigFormValues`) and a single generation hook (`useGenerator`). The backend now provides a dedicated `POST /img2img` endpoint that requires an input image (`init_image`) and adds img2img-specific parameters (`strength`, `resize_mode`) while reusing prompt/styles/loras/clip_skip/sampler/seed.

## Goals / Non-Goals

Goals:

- Provide a clear, first-class Img2Img experience without overloading the existing Text-to-Image submit path.
- Reuse existing UI where it is truly shared (prompt inputs, existing base config sections, previewer).
- Keep `init_image` (base64) ephemeral and out of persistent form storage.

Non-Goals:

- Inpainting, masks, ControlNet.
- Schema changes to backend.

## Key Decisions

### Decision: Separate middle-panel workflows

- Implement `ModeTabs` that renders either a Text-to-Image panel or an Image-to-Image panel.
- Each panel owns its own "Generate" action and uses a dedicated hook.

Rationale:

- Avoids branching logic in a single submit handler.
- Keeps one function/one responsibility (txt2img vs img2img hooks).

### Decision: Base config stays unchanged

- Keep `GeneratorConfigFormValues` as the base interface.
- Add `GeneratorImage2ImageConfigFormValues extends GeneratorConfigFormValues` for img2img-only fields.

Rationale:

- Prevents img2img-only fields from leaking into unrelated UI, validators, persistence, and history paths.

### Decision: Keep img2img-only state outside react-hook-form

- Store `init_image` (base64), `strength`, and `resize_mode` in a dedicated Zustand store.

Rationale:

- Base64 is large and should not be persisted.
- Avoids accidental persistence/serialization of `init_image`.

### Decision: Use enums for mode and resize_mode

- Add `GeneratorMode` enum for UI flow control.
- Add `Image2ImageResizeMode` enum mapping exactly to backend strings (`resize`, `crop`).

Rationale:

- Prevents drift between UI values and backend validation.

### Decision: Reduce denoise confusion

- In Img2Img mode, hide/disable Hires.fix controls.
- Present img2img `strength` as "Denoising Strength" and bind it to `strength` (not `hires_fix.denoising_strength`).

## UX Notes

- Img2Img tab shows an image dropzone at the top, then shared prompt inputs.
- Img2Img generation requires an image; the generate button is disabled until an image is selected.
- Paste (Ctrl/Cmd+V) should load an image from clipboard when Img2Img tab is active.

## Validation Strategy

- Unit tests for `ModeTabs` mode switching and shared prompt rendering.
- Unit tests for `useImage2ImageGenerator` ensuring it calls `POST /img2img`.
- Ensure no regression for `useGenerator` (txt2img).
