# Design: Merge The Backend Into This Repository

## Problem

The backend lives in `andyngdz/exogen_backend`. At startup the app clones or pulls branch `release` of that repository into `userData/exogen_backend` (`scripts/backend/clone-backend.ts`), creates a uv virtual environment there, runs `uv sync`, and starts `uv run uvicorn`. The same directory also holds user data, because backend paths are relative to its working directory (`config.py`, `app/database/constant.py`):

| Path                       | Holds                                                                      |
| -------------------------- | -------------------------------------------------------------------------- |
| `.cache/`                  | Hugging Face models, LoRAs, Real-ESRGAN weights (49 GB on the dev machine) |
| `.venv/`                   | The uv environment (6.2 GB on the dev machine)                             |
| `exogen_backend.db`        | SQLite history database                                                    |
| `static/generated_images/` | Generated images                                                           |

## Decisions Traced To The User

Recorded 2026-09-30 in the planning conversation:

- One repository with a `backend/` folder; the backend stays a separate process ("thêm 1 folder mới thôi ... nó vẫn chạy process riêng").
- The app bundles the backend instead of cloning it ("Đóng gói vào app").
- Full history is kept ("Giữ lịch sử").
- The old repository is archived by the user after the merge ("Archive trên GitHub").
- Code is synced into the existing directory; data paths stay where they are ("Đồng bộ code vào thư mục cũ").
- The six-point summary covering sections 1 to 5 below was approved before this file was written.

## Design

### 1. Import

`git subtree add --prefix=backend https://github.com/andyngdz/exogen_backend.git main` imports the backend's `main` branch with its history as one merge commit. A follow-up commit removes `backend/package.json`, `backend/pnpm-lock.yaml`, `backend/.releaserc.json`, `backend/.husky/` and `backend/.github/`, whose jobs move to the root. `backend/openspec/`, `backend/AGENTS.md` and `backend/.gitignore` stay. The root `.gitignore` gains nothing; `backend/.gitignore` already ignores `.venv/`, `.cache/`, `exogen_backend.db` and generated images.

The pull request must be merged with "Create a merge commit". A squash merge would collapse the imported history into one commit.

### 2. Bundling

`electron-builder.yaml` gains:

```yaml
extraResources:
  - from: backend
    to: backend
    filter:
      - '**/*'
      - '!.venv/**'
      - '!.cache/**'
      - '!tests/**'
      - '!**/__pycache__/**'
      - '!.pytest_cache/**'
      - '!.ruff_cache/**'
      - '!*.db'
      - '!static/generated_images/**'
      - '!*.egg-info/**'
      - '!openspec/**'
      - '!docs/**'
```

The packaged app reads it from `path.join(process.resourcesPath, 'backend')`. In development (`app.isPackaged === false`) the source is `<repo>/backend`.

### 3. Sync instead of clone

`scripts/backend/sync-backend.ts` exports `syncBackend({ sourcePath, backendPath, version, emit })`:

1. Read `backendPath/.exogen-backend-version`. When it equals `version`, emit "Backend is up to date." and return. The dev app passes `version: undefined`, which always syncs, so edits in `backend/` apply on restart.
2. Create `backendPath` when missing.
3. Delete every entry directly under `backendPath` except the protected set, and inside `static/` delete everything except `generated_images/`. Protected: `.venv`, `.cache`, `exogen_backend.db`, `static/generated_images`, `*.log`, `logs.txt`. A `.git` directory from an older cloning app is deleted like any other code entry.
4. Copy the source tree into `backendPath` with `fs.cp(..., { recursive: true, force: true })`, skipping the same excluded patterns as the bundle filter, so a dev sync never copies the developer's own `.venv` or `.cache`.
5. Write `.exogen-backend-version` last, so an interrupted sync repeats on the next start.

`startBackend` keeps its steps and replaces step 3 (`cloneBackend`) with `syncBackend`, taking `sourcePath` and `version` from new `StartBackendOptions` fields that `electron/main.ts` fills from `app.isPackaged`, `process.resourcesPath` and `app.getVersion()`. `clone-backend.ts`, `git.ts`, `BACKEND_REPO_URL`, `BACKEND_BRANCH` and the Git installation message are removed. `BACKEND_DIRNAME` stays `exogen_backend`, so existing installs keep their data in place.

### 4. CI and tooling

- `.github/workflows/backend.yml` runs on pushes and pull requests that touch `backend/**` or the workflow: `uv sync --frozen`, `uv run ruff format --check`, `uv run ruff check`, `uv run ty check`, `uv run pytest --cov=app --cov-report=xml`, then SonarCloud with `projectBaseDir: backend` and the existing `backend/sonar-project.properties` (project `andyngdz_exogen_backend`). Every step runs with `working-directory: backend`.
- `.github/workflows/build.yml` adds `!backend/**` to its path filters, since its globs (`**/*.json`, `**/*.ts`) would otherwise match backend files.
- `lint-staged.config.mjs` adds `backend/**/*.py` → `uv run --directory backend ruff format`, `ruff check --fix` and `ty check` on the staged files, replacing the backend's own husky hook.
- `.github/dependabot.yml` adds the `uv` ecosystem for `/backend`.
- The backend stops releasing on its own. Its version is the app's version.

### 5. After merge

The user archives `andyngdz/exogen_backend` on GitHub after this change lands. Its README gains a note pointing to `exogen/backend/`; branch `release` stays readable, so apps older than this change keep starting.

## Error Handling

- Sync failures emit a `BackendStatusLevel.Error` message naming the failing path and rethrow, so the onboarding backend step shows the failure like any other setup error.
- A missing bundle directory (`sourcePath` not found) is a packaging bug; it emits "Bundled backend not found. Reinstall ExoGen." and stops.

## Testing

- Unit tests for `syncBackend`, against a temp directory:
  - Every protected path survives with its content.
  - Stale code files are removed.
  - `.git` is removed.
  - The version marker skips a second sync and is written last.
  - The dev mode always syncs.
  - Dev copies skip `.venv` and `.cache`.
- `startBackend` tests updated for the new step and options; `clone-backend` and `git` tests removed.
- Backend: the full `uv run pytest` suite passes from `backend/`.
- Build: `pnpm run build` produces an app whose `resources/backend` holds `main.py`, `app/`, `alembic/` and `static/styles/`, and none of the excluded paths.
- End to end: the packaged Linux build starts against a copy of an existing `userData/exogen_backend` git clone; after startup, the backend answers `GET /hardware/`, the history list still shows old runs, and `.cache` is unchanged.
