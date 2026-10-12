# Change: Fix safety checker type mismatch causing intermittent crashes

## Why

Image generation intermittently fails with `AttributeError: 'Image' object has no attribute 'shape'` when the safety checker detects NSFW content. The error occurs because `run_safety_checker` in `latent_decoder.py` passes PIL Images to the diffusers safety checker, but it expects numpy arrays. When NSFW is detected, diffusers tries `np.zeros(images[idx].shape)` which fails on PIL Images.

## What Changes

- Convert PIL images to numpy arrays before calling `pipe.safety_checker()`
- Convert numpy arrays back to PIL images after safety checking
- Update `SafetyChecker` protocol in `app/schemas/model_loader.py` to reflect correct types
- Update type stub in `typings/diffusers/pipelines/stable_diffusion/safety_checker.pyi`

## Impact

- Affected code: `app/cores/generation/latent_decoder.py`, `app/schemas/model_loader.py`, `typings/diffusers/`
- No behavior changes - just fixes the crash
- No architecture changes - preserves existing `output_type='latent'` flow for upscaler support
