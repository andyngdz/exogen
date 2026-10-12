# Change: Add Generator Photoview

## Why

Users need a fast way to inspect generated images at full size (details, artifacts, composition) and quickly iterate. Clicking into a dedicated photoview reduces friction versus inspecting inside small preview tiles.

## What Changes

- Add a generator photoview modal that opens when clicking any generated image (grid or slider).
- Add navigation in the photoview (keyboard + controls) and loop behavior when multiple images exist.
- Add actions in the photoview:
  - Download image
  - Use image as Image-to-Image input (sets init image and switches mode)

## Impact

- Affected specs:
  - New: `generator-photoview`
  - Modified: `img2img-ui`
- Affected code:
  - New: `src/features/generator-photoview/`
  - Updates: `src/features/generator-previewers/`, `src/features/generators/presentations/Generator.tsx`
