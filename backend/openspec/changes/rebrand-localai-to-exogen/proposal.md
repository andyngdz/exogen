# Change: Rebrand LocalAI to Exogen

## Why

The project is being rebranded from "LocalAI" to "Exogen" before public release. This requires updating all references to the old name across configuration files, documentation, and source code.

## What Changes

- **BREAKING**: Database file renamed from `localai_backend.db` to `exogen_backend.db`
- Package name updated from `localai-backend` to `exogen-backend`
- All documentation and code comments updated to reference "Exogen"
- Repository URL references updated to `exogen_backend`
- API response messages updated to reference "Exogen Backend"

## Impact

- Affected specs: None (infrastructure/naming change only)
- Affected code:
  - `pyproject.toml` - package name and description
  - `package.json` - package name, description, repository URL
  - `app/database/constant.py` - database URL
  - `main.py` - app title and health check message
  - `app/__init__.py` - package docstring
  - `ty.toml` - configuration comment
  - `openspec/project.md` - project description
  - `.vscode/settings.json` - SonarQube project key
  - `tests/conftest.py` - docstring
  - `tests/test_main.py` - health check assertion
  - `README.md` - title and repository references
  - `AGENTS.md` - title reference
