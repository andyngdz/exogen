## 1. Implementation

- [x] 1.1 Add `DuplicateLoadRequestError` exception class to `app/cores/model_loader/__init__.py`
- [x] 1.2 Add early detection in `LoaderService.load_model_async()` that raises `DuplicateLoadRequestError` when same model is already loading
- [x] 1.3 Handle `DuplicateLoadRequestError` in `app/features/models/api.py` by returning HTTP 204

## 2. Testing

- [x] 2.1 Add unit test for `DuplicateLoadRequestError` being raised when same model is loading
- [x] 2.2 Add unit test for API returning 204 when `DuplicateLoadRequestError` is raised

## 3. Validation

- [x] 3.1 Run `uv run ruff format && uv run ruff check --fix && uv run ty check`
- [x] 3.2 Run `uv run pytest` to ensure all tests pass
