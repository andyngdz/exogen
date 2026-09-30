# Proposal: Refactor Traditional Upscaler

## Summary

Rename `upscaler.py` to `traditional_upscaler.py` and move img2img refinement logic from `hires_fix.py` into it. This makes `hires_fix.py` a pure orchestrator that delegates to specialized modules.

## Motivation

- Clear separation of concerns: hires_fix orchestrates, traditional_upscaler handles upscale + refine
- Better naming: `traditional_upscaler.py` clearly indicates it handles traditional (non-AI) upscaling
- Consistent with `realesrgan_upscaler.py` naming pattern
- Smaller, focused modules

## Current Structure

```
hires_fix.py (orchestrator + refinement logic)
├── apply() - orchestrates workflow
├── _get_steps() - helper
└── _run_refinement() - img2img refinement

upscaler.py (routing + PIL upscaling)
├── upscale() - routes to PIL or Real-ESRGAN
└── _upscale_pil() - PIL interpolation
```

## Proposed Structure

```
hires_fix.py (pure orchestrator)
└── apply() - orchestrates workflow, delegates to traditional_upscaler

traditional_upscaler.py (upscale + refine for traditional methods)
├── upscale() - PIL interpolation upscaling
├── refine() - img2img refinement pass
└── upscale_and_refine() - combined workflow for traditional upscalers

realesrgan_upscaler.py (AI upscaling - unchanged)
```

## Files Affected

- `app/cores/generation/upscaler.py` → rename to `traditional_upscaler.py`
- `app/cores/generation/traditional_upscaler.py` - add refinement logic
- `app/cores/generation/hires_fix.py` - update imports, delegate refinement
- `tests/app/cores/generation/test_upscaler.py` → rename to `test_traditional_upscaler.py`
- Update all imports referencing `upscaler.py`

## Risk

Low - internal refactoring with no behavior change.
