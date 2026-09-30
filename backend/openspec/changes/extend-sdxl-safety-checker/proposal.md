# Extend Safety Checker to SDXL Models

## Problem

Two issues with the current safety checker implementation:

1. **SDXL has no NSFW protection**: SDXL pipelines don't support `safety_checker`, leaving images without NSFW detection
2. **Diffusers warning**: Passing `safety_checker` to SDXL/SD3 raises a warning since they don't use it

Current behavior:
- SD 1.5: Safety checker runs during pipeline execution
- SDXL/SD3: Safety checker parameter ignored, warning raised, no NSFW protection

## Solution

**Don't pass `safety_checker` to any pipeline.** Run safety checker post-generation for all models with load/unload lifecycle.

Changes:
1. Remove `safety_checker` and `feature_extractor` from pipeline loading parameters
2. Create standalone `SafetyCheckerService` with `load()` and `unload()` methods
3. Load safety checker only when `safety_check_enabled` is true
4. Run safety checker on final images post-generation
5. Unload safety checker immediately after use to free ~600MB memory

Benefits:
- No diffusers warnings for any pipeline type
- Safety checker runs exactly once for all models
- Consistent behavior across SD 1.5, SDXL, and SD3
- Memory efficient: ~600MB freed after each generation
- No memory overhead when safety check is disabled

## Scope

- `app/cores/generation/safety_checker_service.py`: New service with load/unload lifecycle and safety check logic
- `app/cores/model_loader/strategies.py`: Remove safety_checker/feature_extractor params
- `app/cores/model_loader/model_loader.py`: Don't load safety checker during model load
- `app/cores/generation/latent_decoder.py`: Remove `run_safety_checker()` method (moved to service)
- `app/features/generators/base_generator.py`: Call safety_checker_service directly
- `app/schemas/model_loader.py`: Remove safety_checker from pipeline protocol (optional)

## Out of Scope

- Custom sensitivity thresholds (future enhancement)
- Per-model safety checker toggle (using global toggle)

## References

- [Safety Checker for SDXL model · huggingface/diffusers · Discussion #8944](https://github.com/huggingface/diffusers/discussions/8944)
- [safety_checker warning issue · huggingface/diffusers · Issue #1057](https://github.com/huggingface/diffusers/issues/1057)
