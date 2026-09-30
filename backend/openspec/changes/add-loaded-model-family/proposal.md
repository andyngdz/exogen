# Change: Add Loaded Model Family To Models API

## Why
The frontend needs a reliable way to label the currently loaded model (e.g., SDXL vs SD 1.5) without guessing from Hugging Face metadata.

## What Changes
- Add an always-present `loaded_model_family` field to `GET /models/status`.
- Add a `family` field to the `POST /models/load` response.
- Define a small, stable set of family values derived from the loaded diffusers pipeline (authoritative after load).

## Impact
- Affected specs: `openspec/specs/models-api/spec.md` (new)
- Affected code:
  - `app/features/models/api.py`
  - `app/schemas/models.py`
  - `app/cores/model_manager/model_manager.py` (or a small helper in `app/cores/`)
  - `tests/app/features/models/test_api.py`
