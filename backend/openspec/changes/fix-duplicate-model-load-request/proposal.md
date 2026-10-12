# Change: Fix Duplicate Model Load Request Handling

## Why

When a user triggers a model load request while the same model is already loading, the system throws a `ValueError: Cannot load model in state loading` error. This is confusing because it's not really an error - it's expected behavior that should be handled gracefully.

The current code attempts to cancel the in-progress load and start a new one, but due to a race condition, the state check fails before cancellation completes.

## What Changes

- Add `DuplicateLoadRequestError` exception to signal when same model is already loading
- Add early detection in `LoaderService.load_model_async()` for duplicate same-model requests
- Handle the exception in the API layer by returning HTTP 204 (No Content)
- This follows the existing pattern used for `CancellationException`

## Impact

- Affected specs: `model-manager`
- Affected code: `app/cores/model_manager/loader_service.py`, `app/features/models/api.py`
- No breaking changes - API returns 204 instead of 500 for this edge case
