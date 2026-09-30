---
name: error-handling-patterns
description: Use when adding error handling - exception patterns, HTTP codes, domain exceptions
---

# Error Handling Patterns

Use this skill when implementing error handling for features or API endpoints.

## Checklist

### Exception Handling Rules
- [ ] **Never use bare `except`** - always specify exception type
- [ ] Catch specific exceptions first, then broader ones
- [ ] Use domain-specific exception classes with meaningful names
- [ ] Log errors before re-raising or returning error responses

### Domain-Specific Exceptions
- [ ] Create custom exception classes that extend built-in exceptions
- [ ] Use meaningful exception names that describe the error condition
- [ ] Include helpful error messages with context

```python
class ModelNotFoundError(ValueError):
    """Raised when a requested model is not found."""
    pass

class InsufficientMemoryError(RuntimeError):
    """Raised when GPU memory is insufficient for operation."""
    pass
```

### API Response Patterns
- [ ] **Always use Pydantic schemas** for responses (never raw dicts)
- [ ] Include error details in response schema
- [ ] Use appropriate HTTP status codes

### HTTP Status Codes
Use the correct status code for each situation:
- [ ] **200** - Success (operation completed successfully)
- [ ] **400** - Bad Request (invalid input, validation failure)
- [ ] **404** - Not Found (resource doesn't exist)
- [ ] **409** - Conflict (resource already exists, state conflict)
- [ ] **500** - Internal Server Error (unexpected failure)

### Example Pattern

```python
from app.services import logger_service
from app.schemas.responses import ErrorResponse, SuccessResponse

logger = logger_service.get_logger(__name__, category='API')

async def generate_image(config: GenerateConfig, db: Session):
    try:
        result = await service.generate_image(config, db)
        return SuccessResponse(data=result)
    except ValueError as error:
        logger.error(f"Generation failed: {error}")
        raise HTTPException(status_code=400, detail=str(error))
    except torch.cuda.OutOfMemoryError:
        logger.error("Out of GPU memory")
        raise HTTPException(status_code=500, detail="Insufficient GPU memory")
    except Exception as error:
        logger.exception(f"Unexpected error: {error}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

### Validation
- [ ] Verify all exception types are specific (no bare `except:`)
- [ ] Verify all API responses use Pydantic schemas
- [ ] Verify HTTP status codes match the error conditions
- [ ] Verify errors are logged before raising/returning
