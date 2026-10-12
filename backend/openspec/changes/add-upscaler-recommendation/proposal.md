# Add Upscaler Recommendation Flag

## Summary

Add `is_recommended` boolean field to `UpscalerItem` schema to indicate which upscalers are recommended for typical use cases.

## Motivation

Users need guidance on which upscaler to choose. RealESRGAN upscalers produce good results and should be marked as recommended to help users make informed decisions.

## Scope

- Add `is_recommended: bool` field to `UpscalerItem` in `app/schemas/config.py`
- Update `UPSCALER_METADATA` in `app/features/config/service.py` to set recommendation flags
- Mark RealESRGAN upscalers (`RealESRGAN_x2plus`, `RealESRGAN_x4plus`, `RealESRGAN_x4plus_anime`) as recommended
- Mark traditional upscalers as not recommended (still available, just not highlighted)

## Out of Scope

- UI changes to display recommendations
- Sorting upscalers by recommendation status

## Spec Deltas

- `config-api`: Add `is_recommended` field to UpscalerItem entity
