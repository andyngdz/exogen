# Coding Style

**Before implementing code, always check documentation first.** Use MCP tools or WebSearch to verify latest API patterns, security considerations, and best practices. Never guess at API usage.

## Use Standard Library First

**Always check if Python's standard library has a solution before writing custom code.**

- `pathlib` for path operations
- `json`, `csv`, `configparser` for data formats
- `urllib`, `http.client` for network operations
- `datetime`, `time` for time operations

## Functional Programming with Pydash

**Use `pydash` for complex list/collection operations** when it improves readability over nested list comprehensions.

## Imports

**All imports must be at the top of the file.**

- ❌ **Never** import in the middle of code (inside functions, inside classes)
- ✅ **Always** place all imports at the top, after the module docstring
- ✅ Group imports: standard library → third-party → local imports
- ✅ Use absolute imports: `from app.services import logger_service`

```python
# ✅ Good - imports at top
from typing import Optional
from app.services import logger_service

def my_function():
    logger_service.info('hello')

# ❌ Bad - import in the middle
def my_function():
    from app.services import logger_service  # NEVER DO THIS
    logger_service.info('hello')
```

## Type Safety → Use type-safety-mastery skill

**Never use `# type: ignore` or `any` type.** Fix errors at source.

- Prefer `Optional[T]` over `T | None`
- Use Pydantic `BaseModel` over `Dict`/`TypedDict`
- Create type stubs in `typings/` for external libraries
- **Never use `TYPE_CHECKING`** - use shared schemas in `app/schemas/` instead

**For detailed type safety patterns, use the `type-safety-mastery` skill.**

## Type Stubs

**When creating `.pyi` stubs for external libraries, never use `Any`.**

- ✅ Use `**kwargs` without type annotation (ty infers `dict[str, Unknown]`)
- ✅ Omit return type annotations when uncertain (let ty infer)
- ✅ Keep stubs minimal - only stub what you actually use
- ❌ Never use `Any` - defeats the purpose of type stubs

```python
# ✅ Good - no Any, simple and clean
class AutoPipelineForText2Image:
	scheduler: Scheduler
	vae: VAE
	device: torch.device
	
	def __call__(self, **kwargs): ...
	def load_lora_weights(self, path: str, **kwargs) -> None: ...

# ❌ Bad - using Any
class AutoPipelineForText2Image:
	def __call__(self, **kwargs: Any) -> Any: ...  # Don't do this
```

**Rationale:** Type stubs exist to improve type safety. Using `Any` removes all type checking benefits. Omitting type annotations lets ty infer `Unknown`, which still provides type safety while being explicit about uncertainty.

## Documentation

**Add examples to docstrings for helper functions:**

```python
def get_directory_from_path(file_path: str) -> str:
    """Extract directory path from a file path.

    Examples:
        >>> get_directory_from_path('unet/model.safetensors')
        'unet'
    """
    parent = str(PurePosixPath(file_path).parent)
    return parent if parent != '.' else ''
```

## Code Organization → Use code-organization skill

- **Encapsulation**: Use wrapper methods instead of exposing internals
- **File Modularity**: Split files >150 lines
- **Function Design**: One function, one responsibility
- **Variable Naming**: Descriptive names in loops (never `i`, `x`, `p`)
- **Comments**: Only for non-obvious business logic, not what code does

**For detailed organization patterns, use the `code-organization` skill.**

## Comments

**Minimal comments—code should be self-documenting.**

Only add comments when:
- Non-obvious business logic (explain "why", not "what")
- Workarounds/hacks that can't be avoided

```python
# ❌ Bad - over-commenting the obvious
# Decode the latents using VAE
decoder_output = pipe.vae.decode(scaled_latents)
# Get the sample from decoder output
image_tensor = decoder_output.sample

# ✅ Good - code is self-documenting, no comments needed
decoder_output = pipe.vae.decode(scaled_latents)
image_tensor = decoder_output.sample
```

## Refactoring → Use refactoring-patterns skill

**Extract variables to eliminate repetition:**

- Repeated expressions - compute once, reuse
- Complex calculations - break into named steps
- Multiple field accesses - cache lookups
- Function call results - avoid redundant operations

**For detailed refactoring patterns (Extract Variable, Split Temp, Replace Temp with Query), use the `refactoring-patterns` skill.**

## Import Patterns

**Use consistent import aliases:**

```python
from app.database import crud as database_service

lora = database_service.get_lora_by_id(db, lora_id)
```

## Clean Code Principles

**Never use hacky solutions.** Write code that is:

- Clear and maintainable
- Uses proper APIs and patterns
- Follows language idioms
- Can be understood by others

**Understand code patterns before reusing them.** Ask "What problem does this solve?" and "Does this apply here?"

Unit tests passing doesn't guarantee correctness or performance:
- Test with realistic workloads
- Check logs for warnings and timing issues
- Verify fixes don't introduce new problems

**Remember:** Code is read more often than written. Prioritize clarity over cleverness.
