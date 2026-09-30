## 1. Implementation

- [x] 1.1 Add `_configure_utf8_console()` method to `PlatformService` that wraps stdout/stderr with UTF-8 encoding
- [x] 1.2 Call `_configure_utf8_console()` in `PlatformService.init()` for Windows platform

## 2. Testing

- [x] 2.1 Add unit tests for the new UTF-8 console configuration method
- [ ] 2.2 Manually verify pypdl progress bar displays correctly on Windows

## 3. Validation

- [x] 3.1 Run `uv run ruff format && uv run ruff check --fix && uv run ty check`
- [x] 3.2 Run `uv run pytest` to ensure all tests pass
