# Upscaler Module

## ADDED Requirements

### Requirement: Upscaler Module Organization

The system SHALL organize upscaler implementations in `app/cores/upscalers/` with each upscaler type in its own subdirectory containing single-responsibility modules.

#### Scenario: Real-ESRGAN upscaler module structure

- **WHEN** the Real-ESRGAN upscaler is used
- **THEN** the upscaling logic SHALL be in `realesrgan/upscaler.py`
- **AND** the model download and loading SHALL be in `realesrgan/model_manager.py`
- **AND** the cleanup and memory management SHALL be in `realesrgan/resource_manager.py`

#### Scenario: Traditional upscaler module structure

- **WHEN** the traditional upscaler is used
- **THEN** the PIL upscaling logic SHALL be in `traditional/upscaler.py`
- **AND** the img2img refinement SHALL be in `traditional/refiner.py`

### Requirement: Backward Compatible Exports

The system SHALL maintain backward compatible exports via `__init__.py` files so that consumers can import upscalers from the package root.

#### Scenario: Import Real-ESRGAN upscaler

- **WHEN** code imports `from app.cores.upscalers.realesrgan import realesrgan_upscaler`
- **THEN** the import SHALL succeed
- **AND** the upscaler SHALL function identically to the previous implementation

#### Scenario: Import traditional upscaler

- **WHEN** code imports `from app.cores.upscalers.traditional import traditional_upscaler`
- **THEN** the import SHALL succeed
- **AND** the upscaler SHALL function identically to the previous implementation
