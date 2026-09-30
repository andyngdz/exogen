# Change: Add Generation Phase Stepper

## Why

The backend now emits `generation_phase` socket events to indicate major phases during image generation (PR #146). The frontend needs to display this progress to users via a floating stepper UI that shows which generation phase is currently running.

## What Changes

- Add `GENERATION_PHASE` socket event constant
- Add `GenerationPhase` enum with `IMAGE_GENERATION`, `UPSCALING`, `COMPLETED` values
- Add `GenerationPhaseResponse` type for socket event payload
- Create new `generation-phase-stepper` feature with:
  - Zustand store for phase state management
  - Socket event hook for receiving phase updates
  - Floating stepper component (bottom-center, rounded-2xl container)
  - Step item component with pulsing indicator for current step
- Integrate stepper into Generator component

## Impact

- Affected specs: New `generation-phase-stepper` capability
- Affected code:
  - `src/cores/sockets/constants/events.ts` - new event constant
  - `src/cores/sockets/types.ts` - new types
  - `src/cores/sockets/index.ts` - exports
  - `src/features/generation-phase-stepper/` - new feature directory
  - `src/features/generators/presentations/Generator.tsx` - integration
