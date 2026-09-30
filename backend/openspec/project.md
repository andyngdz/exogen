# Project Context

## Purpose

Exogen Backend is the Python FastAPI backend service for Exogen desktop application. It provides AI image generation APIs using Stable Diffusion models, with features like model management, LoRA integration, style presets, and generation history.

## Tech Stack

- **Framework**: FastAPI with async/await throughout
- **Database**: SQLAlchemy 2.0 + SQLite
- **Real-time**: Socket.IO for progress updates and events
- **Testing**: Pytest + pytest-asyncio
- **Type Checking**: ty (strict mode)
- **Formatting**: Ruff (tabs, single quotes, 120 char lines)

## Project Conventions

### Code Style

- Tabs for indentation (not spaces)
- Single quotes for strings
- 120 character line width
- Never use `# type: ignore` or `Any` type
- All imports at top of file (never inside functions/classes)
- Never use `TYPE_CHECKING` - use `app/schemas/` for shared types

### Architecture Patterns

- Feature-first structure: `app/features/` for business logic
- Core services: `app/cores/` for domain logic
- Infrastructure: `app/services/` for utilities
- Shared schemas: `app/schemas/` to avoid circular imports
- Database alias: `from app.database import crud as database_service`

### Testing Strategy

- Pytest with pytest-asyncio for async tests
- Test files mirror source structure in `tests/`
- Aim for 80%+ coverage
- Pre-commit runs: ruff format, ruff check, ty check

### Git Workflow

- Feature branches merged to main
- Husky pre-commit hooks enforce quality

## Domain Context

- **Model**: AI model file (checkpoint) for image generation
- **LoRA**: Low-Rank Adaptation - small fine-tuning weights applied on top of base models
- **Styles**: Predefined prompt modifiers that affect generation aesthetics
- **Pipeline**: Diffusers pipeline for running inference
- **Scheduler**: Sampling algorithm (DPM++, Euler, etc.)

## Important Constraints

- Local-first: Runs locally, no cloud dependencies
- Single-user: No multi-tenancy or authentication needed
- GPU acceleration: CUDA preferred, CPU fallback available
- File modularity: Split files >150 lines into focused modules
- Duplication: Maintain ≤3% duplication (SonarQube quality gate)

## External Dependencies

- PyTorch for deep learning
- Diffusers library for Stable Diffusion
- HuggingFace models (user-provided or downloaded)
