# Tasks

## 1. Schema Update

- [x] 1.1 Add `is_recommended: bool` field to `UpscalerItem` in `app/schemas/config.py`

## 2. Service Update

- [x] 2.1 Update `UPSCALER_METADATA` in `app/features/config/service.py` to include `is_recommended` for each upscaler
- [x] 2.2 Set `is_recommended=True` for RealESRGAN upscalers (x2plus, x4plus, x4plus_anime)
- [x] 2.3 Set `is_recommended=False` for traditional upscalers (Lanczos, Bicubic, Bilinear, Nearest)

## 3. Test Updates

- [x] 3.1 Update tests to verify `is_recommended` field is present in response
- [x] 3.2 Add test to verify correct upscalers are marked as recommended

## 4. Validation

- [x] 4.1 Run `uv run ruff format && uv run ruff check --fix && uv run ty check`
- [x] 4.2 Run `uv run pytest tests/app/features/config_feature/`
