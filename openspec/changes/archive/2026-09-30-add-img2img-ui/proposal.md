# Proposal: Add Img2Img UI

## Change ID

`add-img2img-ui`

## Summary

Add a first-class Image-to-Image (img2img) generation UI to ExoGen, built as a separate middle-panel workflow (ModeTabs) with a dedicated generation hook and API call (`POST /img2img`). The UI reuses existing prompt inputs and shared generator configuration where applicable, while keeping img2img-only fields out of the base generator form.

## Why

- The backend now supports a stable `POST /img2img` workflow with LoRA + CLIP-skip support, resize mode handling, and generation phase socket events.
- The frontend currently only supports Text-to-Image generation.
- Img2Img requires an input image and distinct controls (strength, resize_mode), and should not be bolted into the Text-to-Image submit path.

## What Changes

- Add a generator mode concept (`TEXT_2_IMAGE`, `IMAGE_2_IMAGE`) and a `ModeTabs` component that renders separate middle-panel UIs.
- Refactor prompt inputs into a reusable component used by both modes.
- Add an `ImageInput` zone (drop/click/paste) for img2img input image selection.
- Add img2img-only configuration (strength + resize_mode) and render it conditionally in the left config column.
- Add a dedicated `useImage2ImageGenerator` hook that calls `POST /img2img`.
- Add `Image2ImageResizeMode` enum aligned with backend (`'resize' | 'crop'`).

## Non-Goals

- Inpainting, masking, ControlNet, or multi-image workflows.
- Persisting `init_image` (base64) in local storage or history.
- Changing existing Text-to-Image behavior or payload shape.

## Impact

- Affected UI: generator page middle panel (`ModeTabs`), left config panel (conditional sections).
- Affected API client: `src/services/api.ts` adds an img2img method.
- Affected state: new lightweight stores for generator mode and img2img-only fields.
- New OpenSpec capability: `img2img-ui`.

## Risks / Mitigations

- **Large base64 in state**: Keep `init_image` out of `react-hook-form` persistence and out of history.
- **User confusion between denoise sliders**: Hide/disable Hires.fix while in Img2Img mode and label img2img strength as "Denoising Strength".
- **Backend enum mismatch**: Use a frontend enum that maps exactly to backend strings (`resize`, `crop`).
