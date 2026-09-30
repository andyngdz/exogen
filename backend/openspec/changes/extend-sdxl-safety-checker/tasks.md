# Tasks

## 1. Create SafetyCheckerService

Create standalone service with fully encapsulated safety check logic.

- [ ] Create `app/cores/generation/safety_checker_service.py`
- [ ] Add `check_images(images)` - main public method (no params needed)
- [ ] Internally read `safety_check_enabled` from database
- [ ] Internally get `device`/`dtype` from `model_manager.pipe`
- [ ] Add private `_load(device, dtype)` method
- [ ] Add private `_unload()` method with GPU cache clear
- [ ] Add private `_run_check(images)` method with actual NSFW detection
- [ ] Export singleton instance
- [ ] Write unit tests

**Verify**: `uv run pytest tests/app/cores/generation/test_safety_checker_service.py -v`

## 2. Remove safety_checker from Pipeline Loading

Stop passing safety_checker to pipelines.

- [ ] Update `_load_single_file()` - remove safety_checker param
- [ ] Update `_load_pretrained()` - remove safety_checker param
- [ ] Update `execute_loading_strategies()` - remove safety_checker param
- [ ] Update `model_loader()` - don't load safety checker
- [ ] Remove safety checker constants from model_loader imports
- [ ] Update existing unit tests

**Verify**: `uv run pytest tests/app/cores/model_loader/ -v`

## 3. Update Generator to Use SafetyCheckerService

Replace latent_decoder call and database access with single service call.

- [ ] Import `safety_checker_service` in base_generator.py
- [ ] Replace `latent_decoder.run_safety_checker(pipe, images, enabled=...)` with `safety_checker_service.check_images(images)`
- [ ] Remove database access for `safety_check_enabled` (now in service)
- [ ] Remove `config_crud` and `SessionLocal` imports
- [ ] Update tests

**Verify**: `uv run pytest tests/app/features/generators/test_base_generator.py -v`

## 4. Remove run_safety_checker from LatentDecoder

Clean up unused method.

- [ ] Remove `run_safety_checker()` method from `latent_decoder.py`
- [ ] Remove related imports (numpy, logger if unused)
- [ ] Remove/update tests for removed method

**Verify**: `uv run pytest tests/app/cores/generation/test_latent_decoder.py -v`

## 5. Clean Up Pipeline Protocol (Optional)

Remove safety_checker from protocol since it's no longer used.

- [ ] Update `DiffusersPipelineProtocol` - remove safety_checker and feature_extractor
- [ ] Update tests that mock pipeline with safety_checker

**Verify**: `uv run ty check app tests`

## 6. Integration Test

Verify end-to-end behavior.

- [ ] Test SD 1.5 generation with safety check enabled
- [ ] Test SDXL generation with safety check enabled
- [ ] Verify no diffusers warnings in logs
- [ ] Verify NSFW detection works for both model types
- [ ] Verify memory is freed after generation

**Verify**: Manual test or integration test with mock models
