# 006: Add LoRA Support

**Feature:** Low-Rank Adaptation support for style/character LoRAs
**Status:** ✅ Completed

---

## Problem

Users want to apply style/character LoRAs during image generation but no support exists.

---

## Solution

1. Upload LoRA from filesystem to .cache/loras/
2. Register in database
3. Apply during generation with weights
4. Unload after generation

---

## Architecture

```
User downloads LoRA → POST /loras/upload → Copy to .cache/loras/
                                        → Register in DB
Generate → Load LoRAs with weights → Generate → Unload LoRAs
```

---

## Files Created

```
app/features/loras/
├── __init__.py
├── api.py           # REST endpoints
├── schemas.py       # Pydantic models
├── service.py       # Business logic
└── file_manager.py  # File copy/validation

alembic/versions/{timestamp}_add_loras_table.py
```

## Files Modified

- `app/features/generators/schemas.py` - Add loras field
- `app/features/generators/service.py` - LoRA loading/unloading
- `app/cores/model_manager/pipeline_manager.py` - load_loras(), unload_loras()
- `app/services/storage.py` - LoRA directory paths

---

## API Endpoints

- `POST /loras/upload` - Copy file from path
- `GET /loras` - List all LoRAs
- `DELETE /loras/{id}` - Remove LoRA
- `GET /loras/{id}` - Get details

---

## Diffusers API

```python
pipe.load_lora_weights("path/to/lora.safetensors", adapter_name="lora_1")
pipe.set_adapters(["lora_1", "lora_2"], adapter_weights=[0.8, 0.6])
# Generate...
pipe.unload_lora_weights()
```

---

## Verification

```bash
uv run pytest tests/app/features/loras/ -v
```
