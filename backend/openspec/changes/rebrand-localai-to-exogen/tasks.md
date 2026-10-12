## 1. Update Package Configuration

- [x] 1.1 Update `pyproject.toml`: change name to `exogen-backend`, update description
- [x] 1.2 Update `package.json`: change name, description, and repository URL
- [x] 1.3 Update `ty.toml`: update comment reference

## 2. Update Database Configuration

- [x] 2.1 Update `app/database/constant.py`: change DATABASE_URL to `exogen_backend.db`

## 3. Update Application Code

- [x] 3.1 Update `main.py`: change app title and health check message
- [x] 3.2 Update `app/__init__.py`: change package docstring

## 4. Update Documentation

- [x] 4.1 Update `README.md`: change title and all repository URL references
- [x] 4.2 Update `AGENTS.md`: change title reference
- [x] 4.3 Update `openspec/project.md`: change project description

## 5. Update Tooling Configuration

- [x] 5.1 Update `.vscode/settings.json`: change SonarQube project key

## 6. Update Tests

- [x] 6.1 Update `tests/conftest.py`: change docstring reference
- [x] 6.2 Update `tests/test_main.py`: change health check assertion

## 7. Validation

- [x] 7.1 Run tests to verify health check assertion passes
- [x] 7.2 Run linting and type checking
