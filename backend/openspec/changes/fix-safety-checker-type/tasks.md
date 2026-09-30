## 1. Fix Type Conversion

- [x] 1.1 Update `run_safety_checker()` in `app/cores/generation/latent_decoder.py`:
  - Add `import numpy as np`
  - Convert PIL images to numpy array before `pipe.safety_checker()` call
  - Convert numpy results back to PIL images after

## 2. Update Type Definitions

- [x] 2.1 Update `SafetyChecker` protocol in `app/schemas/model_loader.py` to use `numpy.ndarray` types
- [x] 2.2 Update type stub in `typings/diffusers/pipelines/stable_diffusion/safety_checker.pyi`
- [x] 2.3 Update type stub in `typings/diffusers/__init__.pyi` (also had SafetyChecker definition)

## 3. Testing

- [x] 3.1 Update existing tests in `tests/app/cores/generation/test_latent_decoder.py` to mock numpy array responses
- [x] 3.2 Add new test `test_converts_pil_to_numpy_and_back` to verify conversion behavior
- [x] 3.3 Run type checker: `uv run ty check app/cores/generation/latent_decoder.py` ✓
- [x] 3.4 Run tests: `uv run pytest tests/app/cores/generation/test_latent_decoder.py -v` ✓ (10 passed)
