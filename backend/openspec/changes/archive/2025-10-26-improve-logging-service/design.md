# 004: Improve Logging Service

**Feature:** Enhanced logging with categories, colors, and per-module levels
**Status:** ✅ Completed

---

## Problem

- No visual hierarchy in logs
- Hard to filter by module
- Verbose third-party logs cluttering output
- Inconsistent log format across modules

---

## Solution

Create centralized LoggerService with:
- Colored output (colorlog)
- Category prefixes
- Per-module log level support

### Log Format

```
[LEVEL] YYYY-MM-DD HH:MM:SS  [Category] message
```

### Color Scheme

- DEBUG = cyan
- INFO = green
- WARNING = yellow
- ERROR = red
- CRITICAL = red,bold

---

## Standard Categories (8)

| Category | Purpose |
|----------|---------|
| `[ModelLoad]` | Model loading, state, resources |
| `[Download]` | Model download operations |
| `[Generate]` | Image generation |
| `[API]` | API requests/responses |
| `[Database]` | Database operations |
| `[Service]` | Infrastructure services |
| `[Socket]` | WebSocket communication |
| `[GPU]` | GPU memory management |

---

## Files Created

1. `app/services/logger.py` - CategoryAdapter + LoggerService

## Files Modified

1. 32 files updated to use `logger_service.get_logger(__name__, category='Category')`
2. `main.py` - Call `logger_service.init()`
3. `pyproject.toml` - Add `colorlog==6.9.0`

---

## Usage

```python
from app.services import logger_service

logger = logger_service.get_logger(__name__, category='ModelLoad')
logger.info('Loading model...')  # [INFO] ... [ModelLoad] Loading model...
```

## Environment Variables

```bash
LOG_LEVEL=DEBUG python main.py
LOG_LEVEL_MODEL_LOADER=DEBUG python main.py
```

---

## Verification

```bash
uv run pytest tests/app/services/test_logger.py -v
```
