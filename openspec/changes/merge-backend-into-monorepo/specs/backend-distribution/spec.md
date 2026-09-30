## ADDED Requirements

### Requirement: Backend Source In This Repository

The backend source SHALL live in `backend/` of this repository with the history of the former `exogen_backend` repository.

#### Scenario: History is preserved

- **WHEN** `git blame backend/main.py` runs on `main` after the merge
- **THEN** its lines are attributed to commits authored in the former `exogen_backend` repository
- **AND** the subtree merge commit's second parent reaches all 558 former commits

#### Scenario: Backend tests run from the folder

- **WHEN** `uv sync --frozen` and `uv run pytest` run in `backend/`
- **THEN** the backend test suite passes

### Requirement: Backend Bundled In The App

The packaged app SHALL contain the backend source under `resources/backend`, without environments, caches, tests or user data.

#### Scenario: Bundle contents

- **WHEN** the app is built with electron-builder
- **THEN** `resources/backend` contains `main.py`, `app/`, `alembic/`, `alembic.ini`, `pyproject.toml`, `uv.lock`, `.python-version` and `static/styles/`
- **AND** it contains no `.venv`, `.cache`, `tests`, `__pycache__`, `*.db` or `static/generated_images`

### Requirement: Backend Sync Instead Of Clone

At startup the app SHALL copy the bundled backend into `userData/exogen_backend` instead of cloning a repository.

#### Scenario: First start on a new machine

- **WHEN** the app starts and `userData/exogen_backend` does not exist
- **THEN** the bundled backend is copied there
- **AND** `.exogen-backend-version` holds the app version
- **AND** the backend starts through uv

#### Scenario: Same version already synced

- **WHEN** the app starts and `.exogen-backend-version` equals the app version
- **THEN** no file under `userData/exogen_backend` is copied or deleted

#### Scenario: App updated

- **WHEN** the app starts with a version different from `.exogen-backend-version`
- **THEN** code files from the previous version that the new bundle lacks are deleted
- **AND** the new bundle's files are copied
- **AND** the version marker is written after the copy finishes

#### Scenario: Code missing despite a matching marker

- **WHEN** `.exogen-backend-version` equals the app version but `main.py` is missing
- **THEN** the sync runs again

#### Scenario: Git is not installed

- **WHEN** the app starts on a machine without Git
- **THEN** setup stops before the sync with the Git install hint, because `uv sync` fetches a Git-sourced dependency

### Requirement: User Data Survives Sync

The sync SHALL never modify or delete the models, virtual environment, database or generated images kept in the backend directory.

#### Scenario: Upgrade from a cloning app version

- **WHEN** `userData/exogen_backend` is a git clone from an older app, with `.git`, `.venv`, `.cache`, `exogen_backend.db`, `exogen_backend.db-journal` and files in `static/generated_images`
- **THEN** after the sync, all of them keep their exact contents
- **AND** code files from the clone that the bundle lacks are gone
- **AND** the backend serves the history stored in `exogen_backend.db`

#### Scenario: Development sync

- **WHEN** the unpackaged app syncs from `<repo>/backend` that contains the developer's own `.venv`, `.cache`, database, journal and logs
- **THEN** none of them is copied into `userData/exogen_backend`
- **AND** no version marker is written

### Requirement: Backend Continuous Integration

Changes under `backend/` SHALL run the backend checks in this repository's CI.

#### Scenario: Backend pull request

- **WHEN** a pull request changes a file under `backend/`
- **THEN** CI runs ruff format check, ruff check, ty check and pytest with coverage in `backend/`
- **AND** reports to the SonarCloud project `andyngdz_exogen_backend`

#### Scenario: Backend-only change skips the frontend workflow

- **WHEN** a pull request changes only files under `backend/`
- **THEN** the frontend `build.yml` workflow does not run
