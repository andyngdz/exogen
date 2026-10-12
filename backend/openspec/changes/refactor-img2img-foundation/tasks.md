# Tasks: Refactor Img2Img Foundation

## Prerequisites

- [x] Verify clean git status

## 1. Schema Updates

- [x] 1.1 Update `app/schemas/img2img.py`
  - Add `loras` field to `Img2ImgConfig`
  - Add `clip_skip` field to `Img2ImgConfig`
  - Ensure compatibility with `GeneratorConfig` (where applicable)

## 2. Core Img2Img Implementation

- [x] 2.1 Create `app/features/img2img/base_img2img.py`
  - Implement `BaseImg2Img` class
  - Implement `execute_pipeline` method
  - Integrate `Img2ImgPhaseTracker`
  - Integrate `SafetyCheckerService`

- [x] 2.2 Create `app/features/img2img/config_validator.py`
  - Implement `validate_config` method
  - Validate image dimensions, batch sizes, etc.

## 3. Refactor Img2Img Service

- [x] 3.1 Update `app/features/img2img/service.py`
  - Remove monolithic generation logic
  - Import `BaseImg2Img` and `config_validator`
  - Integrate `LoRALoader` for loading/unloading LoRAs
  - Implement `generate_image_from_image` using the new modular components

## 4. Test Updates

- [x] 4.1 Update `tests/app/features/img2img/test_service.py`
  - Mock `BaseImg2Img`, `config_validator`, and `lora_loader`
  - Verify orchestration logic
  - Verify LoRA loading/unloading

- [x] 4.2 Create `tests/app/features/img2img/test_base_img2img.py`
  - Test core pipeline execution
  - Test phase emission
  - Test safety checker integration

- [x] 4.3 Create `tests/app/features/img2img/test_config_validator.py`
  - Test validation rules

## 5. Validation

- [x] Run `uv run ruff format`
- [x] Run `uv run ruff check`
- [x] Run `uv run ty check`
- [x] Run `uv run pytest tests/app/features/img2img/`
- [ ] Manual verification of img2img generation
- [ ] Manual verification of LoRA application in img2img
