# Design: Standalone Safety Checker

## Current Architecture

```
model_loader.py
  └── loads StableDiffusionSafetyChecker
  └── passes to strategies.py
        └── attaches to pipeline (safety_checker, feature_extractor)

latent_decoder.py
  └── run_safety_checker(pipe, images)
        └── uses pipe.safety_checker (None for SDXL)
```

**Problem**: Safety checker is coupled to pipeline. SDXL pipelines don't accept it.

## New Architecture

```
safety_checker_service.py (new singleton)
  └── load(device, dtype) - loads models on demand
  └── run_safety_check(images) -> (images, nsfw_flags)
  └── unload() - frees memory

model_loader.py
  └── no longer loads safety checker
  └── strategies don't pass safety_checker to pipelines

base_generator.py
  └── calls safety_checker_service directly (no latent_decoder indirection)
```

**Removed**: `latent_decoder.run_safety_checker()` - all safety logic moves to `SafetyCheckerService`.

## Component: SafetyCheckerService

Location: `app/cores/generation/safety_checker_service.py`

```python
class SafetyCheckerService:
    _safety_checker: Optional[StableDiffusionSafetyChecker] = None
    _feature_extractor: Optional[CLIPImageProcessor] = None

    def check_images(
        self,
        images: list[Image.Image],
    ) -> tuple[list[Image.Image], list[bool]]:
        """Check images for NSFW content. Handles full lifecycle.

        - Reads safety_check_enabled from database
        - Gets device/dtype from model_manager.pipe
        - If disabled: returns images unchanged with [False] flags
        - If enabled: loads model, checks, unloads model
        """
        db = SessionLocal()
        try:
            enabled = config_crud.get_safety_check_enabled(db)
        finally:
            db.close()

        if not enabled:
            return images, [False] * len(images)

        pipe = model_manager.pipe
        self._load(pipe.device, pipe.dtype)
        try:
            return self._run_check(images)
        finally:
            self._unload()

    def _load(self, device: torch.device, dtype: torch.dtype) -> None:
        """Load safety checker models to specified device."""
        self._safety_checker = StableDiffusionSafetyChecker.from_pretrained(...)
        self._feature_extractor = CLIPImageProcessor.from_pretrained(...)
        self._safety_checker.to(device=device, dtype=dtype)

    def _unload(self) -> None:
        """Unload safety checker to free memory."""
        del self._safety_checker
        del self._feature_extractor
        self._safety_checker = None
        self._feature_extractor = None
        torch.cuda.empty_cache()  # if CUDA available

    def _run_check(self, images: list[Image.Image]) -> tuple[list[Image.Image], list[bool]]:
        # ... actual safety check logic
```

## Usage Flow

```python
# base_generator.py - single call, fully encapsulated
images, nsfw = safety_checker_service.check_images(images)
```

The service handles everything internally:
1. Read `safety_check_enabled` from database
2. If disabled: return `(images, [False] * len(images))` immediately
3. Get `device`/`dtype` from `model_manager.pipe`
4. If enabled: load → check → unload

This ensures:
- Safety checker only loaded when needed
- Memory freed immediately after use (~600MB returned to GPU/RAM)
- No memory overhead when safety check is disabled

## Trade-offs

### Option A: Singleton Service (chosen)
- **Pros**: Lazy loading, single instance, easy to test with mock
- **Cons**: Module-level state

### Option B: Pass components through call chain
- **Pros**: Explicit dependencies, no global state
- **Cons**: Many function signatures change, threading components through

### Option C: Load in latent_decoder on demand
- **Pros**: Simple, localized
- **Cons**: Repeated loading if decoder recreated, harder to test

**Decision**: Option A - singleton service with lazy loading. Matches project patterns (e.g., `device_service`, `storage_service`).

## Device Placement

Safety checker needs to run on same device as pipeline for efficiency:
- Accept `device` and `dtype` parameters
- Move safety checker to device before inference
- Keep on device for subsequent calls (likely same device)

## Memory Considerations

- Safety checker is ~600MB
- Load on-demand when safety_check_enabled is true
- Unload immediately after safety check completes
- Uses `torch.cuda.empty_cache()` to return GPU memory
