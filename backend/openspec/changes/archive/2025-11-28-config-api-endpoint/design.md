# 009: Config API Endpoint

**Feature:** GET /config endpoint for frontend configuration data
**Status:** ✅ Completed

---

## Problem

Frontend needs configuration data (upscaler options, etc.) without hardcoding values.

---

## Solution

Create `/config` endpoint returning upscaler metadata with suggested denoise strengths.

---

## Files Created

```
app/schemas/config.py       # UpscalerItem, ConfigResponse
app/features/config/
├── __init__.py
├── api.py                  # GET /config endpoint
└── service.py              # ConfigService, UPSCALER_METADATA

tests/app/features/config_feature/
├── test_config_service.py
└── test_config_api.py
```

## Files Modified

- `main.py` - Register config router

---

## API Response

```json
{
  "upscalers": [
    {"value": "Lanczos", "name": "Lanczos (High Quality)", "description": "...", "suggested_denoise_strength": 0.4},
    {"value": "Bicubic", "name": "Bicubic (Smooth)", "description": "...", "suggested_denoise_strength": 0.4},
    {"value": "Bilinear", "name": "Bilinear (Fast)", "description": "...", "suggested_denoise_strength": 0.35},
    {"value": "Nearest", "name": "Nearest (Sharp Edges)", "description": "...", "suggested_denoise_strength": 0.3}
  ]
}
```

---

## Denoise Strength Rationale

- **Lanczos (0.4)** - Sharp results handle moderate refinement
- **Bicubic (0.4)** - Good all-around balance
- **Bilinear (0.35)** - Softer output needs less modification
- **Nearest (0.3)** - Preserves hard edges, minimal change

---

## Verification

```bash
uv run pytest tests/app/features/config_feature/ -v
```
