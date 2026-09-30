# Change: Refactor Hires Fix Request

## Why
Hires fix is shared logic used by multiple generation features, but it is currently coupled to `GeneratorConfig`. This makes reuse across features (e.g., img2img) awkward and risks mismatched prompts between passes.

## What Changes
- Introduce a dedicated `HiresFixRequest` schema so any feature that wants hires fix must provide the exact required parameters.
- Update hires fix application to use the final processed prompts (after style application) for the refinement pass.
- Extend img2img to optionally run hires fix using the same upscaler chain as text-to-image.

## Impact
- Affected specs: `img2img`, `hires-fix`
- Affected code: `app/cores/generation/hires_fix.py`, `app/cores/upscalers/traditional/`, `app/features/generators/`, `app/features/img2img/`, schemas and tests
