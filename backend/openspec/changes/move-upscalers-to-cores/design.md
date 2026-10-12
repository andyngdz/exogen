# Design: Upscaler Module Architecture

## Context

The current upscaler implementations in `app/cores/generation/` violate single responsibility:
- `realesrgan_upscaler.py` (151 lines) mixes model downloading, loading, upscaling, and cleanup
- `traditional_upscaler.py` (138 lines) mixes PIL upscaling and img2img refinement

This refactoring separates concerns into focused modules while maintaining the same external behavior.

## Goals

- Split each upscaler into single-responsibility modules
- Maintain backward compatibility (no API changes to `hires_fix.py`)
- Keep files under 150 lines per project convention
- Improve testability with focused, isolated modules

## Non-Goals

- Adding new upscaler types
- Changing upscaling behavior or algorithms
- Modifying the public API

## Module Design

### Real-ESRGAN Module (`app/cores/upscalers/realesrgan/`)

```
realesrgan/
├── __init__.py          # Exports: realesrgan_upscaler
├── upscaler.py          # RealESRGANUpscaler class (~60 lines)
├── model_manager.py     # RealESRGANModelManager class (~70 lines)
└── resource_manager.py  # RealESRGANResourceManager class (~20 lines)
```

**upscaler.py** - Orchestrates the upscaling process:
- `upscale(images, upscaler_type, target_scale)` - Main entry point
- `_upscale_images(images)` - Process images through model
- `_resize_to_target_scale(...)` - Adjust to target scale

**model_manager.py** - Handles model lifecycle:
- `get_or_download(upscaler_type)` - Download if not cached, return path
- `load(upscaler_type)` - Load model into memory, return RealESRGANer
- `_create_network(upscaler_type, scale)` - Create RRDBNet architecture

**resource_manager.py** - Manages cleanup:
- `cleanup(model)` - Free GPU memory and unload model

### Traditional Module (`app/cores/upscalers/traditional/`)

```
traditional/
├── __init__.py          # Exports: traditional_upscaler
├── upscaler.py          # TraditionalUpscaler class (~60 lines)
└── refiner.py           # Img2ImgRefiner class (~50 lines)
```

**upscaler.py** - PIL interpolation upscaling:
- `upscale(config, pipe, generator, images, ...)` - Main entry point
- `_upscale_pil(images, scale_factor, upscaler_type)` - PIL resize

**refiner.py** - Img2img refinement:
- `refine(config, pipe, generator, images, steps, denoising_strength)` - Add detail via img2img

## Dependency Flow

```
hires_fix.py
    │
    ├── realesrgan/
    │   └── upscaler.py
    │       ├── model_manager.py
    │       └── resource_manager.py
    │
    └── traditional/
        └── upscaler.py
            └── refiner.py
```

## Backward Compatibility

The `__init__.py` files will export the same instances:

```python
# app/cores/upscalers/realesrgan/__init__.py
from app.cores.upscalers.realesrgan.upscaler import realesrgan_upscaler

# app/cores/upscalers/traditional/__init__.py
from app.cores.upscalers.traditional.upscaler import traditional_upscaler
```

`hires_fix.py` import changes:
```python
# Before
from app.cores.generation.realesrgan_upscaler import realesrgan_upscaler
from app.cores.generation.traditional_upscaler import traditional_upscaler

# After
from app.cores.upscalers.realesrgan import realesrgan_upscaler
from app.cores.upscalers.traditional import traditional_upscaler
```

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing behavior | Run all tests after each refactoring step |
| Circular imports | Use dependency injection where needed |
| Missing edge cases | Preserve all existing test cases |

## Open Questions

None - design is straightforward internal refactoring.
