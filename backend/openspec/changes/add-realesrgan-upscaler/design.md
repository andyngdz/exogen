# Design: Real-ESRGAN AI Upscaler

## Context

The hires fix workflow currently upscales decoded PIL images using mathematical interpolation (Lanczos, Bicubic). While fast, these methods produce blurry results at 2x+ scale factors. Real-ESRGAN is a neural network-based upscaler that preserves edges, adds texture detail, and can optionally enhance faces using GFPGAN.

**Constraints**:
- Must work on CUDA, MPS, and CPU (with fallback)
- Must not increase VRAM usage when not in use (load per-request)
- Must follow existing memory management patterns (ResourceManager)

## Goals / Non-Goals

**Goals**:
- Support all 4 Real-ESRGAN models (x2plus, x4plus, anime variants)
- Optional GFPGAN face enhancement
- Per-request model loading to minimize VRAM footprint
- Seamless integration with existing hires fix workflow

**Non-Goals**:
- Video upscaling (single frame only)
- Model fine-tuning or training
- Persistent model loading (would consume ~500MB VRAM continuously)

## Decisions

### Decision 1: Per-Request Loading

**What**: Load Real-ESRGAN model when upscale() called, unload after.

**Why**: Real-ESRGAN models are 60-130MB in VRAM. Since upscaling happens infrequently (only during hires fix), keeping models loaded wastes memory. Loading takes ~2-3 seconds which is acceptable for a quality enhancement step.

**Alternatives considered**:
- Lazy load + keep in memory: Rejected - wastes VRAM when not generating
- Load at startup: Rejected - delays app start, wastes memory

### Decision 2: Set-Based Routing in ImageUpscaler

**What**: Define constant sets in `app/constants/upscalers.py` and check membership for routing.

```python
# app/constants/upscalers.py
PIL_UPSCALERS = {UpscalerType.LANCZOS, UpscalerType.BICUBIC, UpscalerType.BILINEAR, UpscalerType.NEAREST}
REALESRGAN_UPSCALERS = {UpscalerType.REALESRGAN_X2PLUS, UpscalerType.REALESRGAN_X4PLUS, UpscalerType.REALESRGAN_X4PLUS_ANIME}

# app/cores/generation/upscaler.py (logic only, imports constants)
from app.constants.upscalers import REALESRGAN_UPSCALERS

if upscaler_type in REALESRGAN_UPSCALERS:
    return realesrgan_upscaler.upscale(...)
else:
    # PIL interpolation
```

**Why**:
- Easy to extend: just add new types to the appropriate set
- No enum methods needed
- Clear, readable routing logic
- Sets have O(1) lookup

### Decision 3: Model Weights via GitHub Releases with pypdl

**What**: Download model weights from GitHub releases using [pypdl](https://github.com/mjishnu/pypdl) library with a typed schema for model metadata.

**File organization**:
- Schema (`app/schemas/hires_fix.py`): `RemoteModel` Pydantic model
- Constants (`app/constants/upscalers.py`): `REALESRGAN_MODELS` dict
- Logic (`app/cores/generation/realesrgan_upscaler.py`): download logic

```python
# app/schemas/hires_fix.py
class RemoteModel(BaseModel):
    """Schema for downloadable model from internet."""
    url: str = Field(..., description='Download URL')
    filename: str = Field(..., description='Local filename to save as')
    scale: int = Field(..., description='Upscaling factor (2 or 4)')

# app/constants/upscalers.py
REALESRGAN_MODELS: dict[UpscalerType, RemoteModel] = {
    UpscalerType.REALESRGAN_X2PLUS: RemoteModel(
        url='https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth',
        filename='RealESRGAN_x2plus.pth',
        scale=2,
    ),
    # ... other models
}

# app/cores/generation/realesrgan_upscaler.py (logic only)
from app.constants.upscalers import REALESRGAN_MODELS

def _get_model_path(self, upscaler_type: UpscalerType) -> str:
    model = REALESRGAN_MODELS[upscaler_type]
    # download logic...
```

**Why**:
- Typed schema with Pydantic validation (no string parsing)
- Explicit filename - no URL splitting hacks
- Scale factor stored with model (needed for RealESRGANer initialization)
- Easy to extend with more fields (hash, size, etc.)
- Multi-segment parallel downloads via pypdl

### Decision 4: Post-Upscale Resize for Non-Native Scales

**What**: Resize after AI upscaling when user's desired scale differs from model's native scale.

```python
def upscale(images: list[Image.Image], upscaler_type: UpscalerType, target_scale: float) -> list[Image.Image]:
    model = REALESRGAN_MODELS[upscaler_type]

    # AI upscale at native scale (2x or 4x)
    upscaled = self._ai_upscale(images, model)

    # Resize if target differs from native
    if target_scale != model.scale:
        original_width, original_height = images[0].size  # PIL returns (width, height)
        target_width = int(original_width * target_scale)
        target_height = int(original_height * target_scale)
        upscaled = [img.resize((target_width, target_height), Image.LANCZOS) for img in upscaled]

    return upscaled
```

**Model selection logic**:
| User scale | Model | Why |
|------------|-------|-----|
| 1.5x - 2x | x2plus | Native 2x, resize down if needed |
| 2.1x - 4x | x4plus | Native 4x, resize down if needed |

**Why**:
- Real-ESRGAN models only support fixed scales (2x or 4x)
- User expects their chosen scale (1.5, 2, 3, 4) to be respected
- AI upscale → Lanczos resize preserves quality better than forcing non-native scale

### Decision 5: Face Enhancement as Optional Flag

**What**: Add `is_face_enhance: bool` to HiresFixConfig, passed through to upscaler.

**Why**: GFPGAN adds processing time and is only useful for portraits. Users should opt-in. The `is_` prefix follows our naming convention for boolean fields.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Model loading adds 2-3s latency | Acceptable for quality improvement; document in UI |
| GFPGAN adds dependencies (facexlib) | Optional feature, dependencies bundled with realesrgan |
| MPS compatibility unknown | Fallback to CPU if MPS fails; test on Apple Silicon |

## Architecture

```
HiresFixProcessor
    │
    ▼
ImageUpscaler.upscale(images, type, is_face_enhance)
    │
    ├─ type in REALESRGAN_UPSCALERS? ──► RealESRGANUpscaler.upscale()
    │                                        │
    │                                        ├─ _load_model(type)
    │                                        ├─ _upscale_images()
    │                                        ├─ _apply_face_enhance() [if enabled]
    │                                        └─ _cleanup()
    │
    └─ type in PIL_UPSCALERS? ──► PIL interpolation (existing)
```

## Model Details

| Model | Scale | VRAM | Use Case |
|-------|-------|------|----------|
| RealESRGAN_x2plus | 2x | ~60MB | General images, 2x upscale |
| RealESRGAN_x4plus | 4x | ~60MB | General images, 4x upscale |
| RealESRGAN_x4plus_anime_6B | 4x | ~130MB | Anime/illustrations |

## Open Questions

None - design is straightforward given existing patterns.
