## 1. Schema Changes

- [x] 1.1 Add `GenerationPhase` enum with `IMAGE_GENERATION`, `UPSCALING`, `COMPLETED` values
- [x] 1.2 Add `GENERATION_PHASE` to `SocketEvents` enum
- [x] 1.3 Add `GenerationPhaseResponse` schema with `phases` and `current` fields

## 2. Socket Service

- [x] 2.1 Add `generation_phase()` method to `SocketService`

## 3. Phase Tracker

- [x] 3.1 Create `GenerationPhaseTracker` class in `app/cores/generation/phase_tracker.py`
- [x] 3.2 Initialize tracker with config to determine phases (check `hires_fix`)
- [x] 3.3 Implement `start()` method - emits `image_generation` phase
- [x] 3.4 Implement `upscaling()` method - emits `upscaling` phase
- [x] 3.5 Implement `complete()` method - emits `completed` phase

## 4. Integration

- [x] 4.1 Create `GenerationPhaseTracker` in `execute_pipeline()`
- [x] 4.2 Call `tracker.start()` before pipeline execution
- [x] 4.3 Call `tracker.upscaling()` before hires fix (inside `_apply_hires_fix`)
- [x] 4.4 Call `tracker.complete()` at end of `execute_pipeline()`

## 5. Testing

- [x] 5.1 Add tests for `GenerationPhase` enum serialization
- [x] 5.2 Add tests for `GenerationPhaseResponse` schema
- [x] 5.3 Add tests for `generation_phase()` socket service method
- [x] 5.4 Add tests for `GenerationPhaseTracker` class
- [x] 5.5 Add tests for phase event emission in base generator
