# Change: Add Real-ESRGAN AI Upscaler

## Why

Current upscaling uses PIL interpolation (Lanczos, Bicubic, etc.) which produces blurry results at high scale factors. Real-ESRGAN is a state-of-the-art AI upscaler that preserves details and adds texture during upscaling, significantly improving hires fix quality.

## What Changes

- Add 3 Real-ESRGAN models: x2plus, x4plus, x4plus_anime
- Add GFPGAN face enhancement option for portrait upscaling
- Extend UpscalerType enum with AI upscaler variants
- Add HiresFixConfig.is_face_enhance field
- Add UpscalingMethod enum (TRADITIONAL | AI) to UpscalerItem schema
- Load models per-request to save VRAM (load → upscale → unload)
- New capability: ai-upscaler for Real-ESRGAN integration

## Impact

- Affected specs: config-api (new upscaler options), ai-upscaler (new capability)
- Affected code:
  - `app/schemas/hires_fix.py` - Extend UpscalerType enum
  - `app/cores/generation/upscaler.py` - Delegate to AI upscaler
  - `app/cores/generation/realesrgan_upscaler.py` - NEW
  - `app/cores/generation/hires_fix.py` - Pass is_face_enhance
  - `typings/realesrgan.pyi` - Type stubs
- New dependencies: realesrgan, gfpgan, basicsr, facexlib, pypdl
