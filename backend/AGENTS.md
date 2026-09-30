<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Agent Guide for Exogen Backend

## Quick Commands

```bash
# Run tests
uv run pytest                              # All tests
uv run pytest tests/path/to/test_file.py   # Single test file
uv run pytest tests/path/to/test_file.py::TestClass::test_method  # Single test

# Code quality (pre-commit runs these automatically)
uv run ruff format && uv run ruff check --fix && uv run ty check

# Run application (migrations run automatically on startup)
uv run python main.py        # Start server
```

## Code Style Essentials

**Formatting**: Tabs (not spaces), single quotes, 120 char lines (see `ruff.toml`)
**Types**: Never use `# type: ignore` or `Any` (even in `typings/` stubs - use unannotated `**kwargs` instead)
**Imports**: All imports at top - **never import in the middle of code** (inside functions/classes) - **never use `TYPE_CHECKING`**, use `app/schemas/` for shared types instead
**Architecture**: `app/features/` (business), `app/cores/` (domain), `app/services/` (infra), `app/schemas/` (shared types)
**Files**: Split files >150 lines into focused modules; service files are thin orchestrators
**Naming**: Descriptive names in loops (never `i`, `x`, `p`); use `database_service` alias for `app.database.crud`
**Comments**: Minimal—code should be self-documenting; only comment "why" not "what"
**Error Handling**: Pydantic models over dicts; proper exception chaining with `from error`
**No defensive code**: Call methods directly (e.g., `callback.reset()` not `if hasattr(callback, 'reset')`)

## Documentation to Read

- @docs/ARCHITECTURE.md - Stack, structure, circular imports, modularity rules
- @docs/CODING_STYLE.md - Complete style guide with examples
- @docs/DEVELOPMENT_COMMANDS.md - All available commands
-
