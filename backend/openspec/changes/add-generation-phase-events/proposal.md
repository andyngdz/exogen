# Change: Add Generation Phase Events

## Why

The frontend needs to display a stepper showing which major phase of image generation is currently running. The stepper must know upfront which phases will occur so it can render the full progress bar (e.g., `[Loading] Image Generation -- Upscaling -- Completed`).

Currently, the backend emits step-level progress (`image_generation_step_end`) but no high-level phase events to indicate transitions between generation and upscaling.

## What Changes

- Add new `GenerationPhase` enum for major generation phases: `IMAGE_GENERATION`, `UPSCALING`, `COMPLETED`
- Add `GENERATION_PHASE` to `SocketEvents` enum
- Add `GenerationPhaseResponse` schema with `phases` (list) and `current` (active phase)
- Add `GenerationPhaseTracker` class to centralize phase management:
  - Initialized with config to determine available phases
  - Provides `start()`, `upscaling()`, `complete()` methods
  - Each method emits event with full phases list and current phase
- Add `generation_phase()` method to `SocketService` for event emission

## Impact

- Affected specs: New `generation-phase-events` capability
- Affected code:
  - `app/schemas/socket.py` - new enum, response schema
  - `app/socket/service.py` - new emit method
  - `app/cores/generation/phase_tracker.py` - new tracker class
  - `app/features/generators/base_generator.py` - use phase tracker
