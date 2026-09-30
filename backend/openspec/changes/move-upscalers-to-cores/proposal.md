# Proposal: Refactor Upscalers into Dedicated Core Module

## Change ID

`move-upscalers-to-cores`

## Summary

Move and refactor upscalers from `app/cores/generation/` to a new `app/cores/upscalers/` module with proper separation of concerns. Each upscaler type gets its own subdirectory with single-responsibility modules.

## Motivation

1. **Single Responsibility**: Current files mix upscaling logic, model management, and resource cleanup
2. **Better organization**: Upscalers are a distinct domain concern, not generation utilities
3. **Follows existing patterns**: Other core domains have dedicated directories (model_loader, samplers)
4. **Maintainability**: Smaller, focused files are easier to test and modify

## Scope

**In scope:**
- Move upscalers to `app/cores/upscalers/`
- Refactor Real-ESRGAN into 3 modules (upscaler, model_manager, resource_manager)
- Refactor Traditional into 2 modules (upscaler, refiner)
- Update imports in dependent files
- Move and update tests

**Out of scope:**
- No functional changes to upscaling behavior
- No new features

## Target Structure

```
app/cores/upscalers/
├── __init__.py
├── realesrgan/
│   ├── __init__.py
│   ├── upscaler.py           # Core upscaling logic
│   ├── model_manager.py      # Download + load model into memory
│   └── resource_manager.py   # Cleanup and memory management
└── traditional/
    ├── __init__.py
    ├── upscaler.py           # PIL interpolation upscaling
    └── refiner.py            # Img2img refinement pass
```

## Module Responsibilities

### Real-ESRGAN

| Module | Responsibility | Current Methods |
|--------|---------------|-----------------|
| `upscaler.py` | Orchestrate upscaling, image processing | `upscale()`, `_upscale_images()`, `_resize_to_target_scale()` |
| `model_manager.py` | Download, cache, and load models | `_get_model_path()`, `_load_model()`, `_create_network()` |
| `resource_manager.py` | Cleanup model and free GPU memory | `_cleanup()` |

### Traditional

| Module | Responsibility | Current Methods |
|--------|---------------|-----------------|
| `upscaler.py` | PIL interpolation upscaling | `upscale()`, `_upscale_pil()` |
| `refiner.py` | Img2img refinement pass | `refine()` |

## Impact Analysis

### Files Requiring Import Updates
- `app/cores/generation/hires_fix.py`

### Test Structure
```
tests/app/cores/upscalers/
├── __init__.py
├── realesrgan/
│   ├── __init__.py
│   ├── test_upscaler.py
│   ├── test_model_manager.py
│   └── test_resource_manager.py
└── traditional/
    ├── __init__.py
    ├── test_upscaler.py
    └── test_refiner.py
```

## Risk Assessment

- **Low risk**: Internal refactoring with no API changes
- **Easily reversible**: Can revert with git if issues arise
- **Well-tested**: Existing tests ensure behavior preserved

## Success Criteria

1. All tests pass after refactoring
2. Type checking passes (`ty check`)
3. Linting passes (`ruff check`)
4. Application runs correctly with hires fix feature
5. No functional changes to upscaling behavior
