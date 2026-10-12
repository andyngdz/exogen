# Design: Merge The Backend Into This Repository

## Problem

The backend lives in `andyngdz/exogen_backend`. At startup the app clones or pulls branch `release` of that repository into `userData/exogen_backend` (`scripts/backend/clone-backend.ts`), checks the directory, runs `uv sync` (which creates the virtual environment), and starts `uv run uvicorn`. The same directory also holds user data, because backend paths are relative to its working directory (`config.py`, `app/database/constant.py`):

| Path                                             | Holds                                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `.cache/`                                        | Hugging Face models, LoRAs, Real-ESRGAN weights (49 GB on the dev machine)      |
| `.venv/`                                         | The uv environment (6.2 GB on the dev machine)                                  |
| `exogen_backend.db`, `exogen_backend.db-journal` | SQLite history database and its rollback journal (or `-wal`/`-shm` in WAL mode) |
| `static/generated_images/`                       | Generated images                                                                |

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

1. Refuse any `backendPath` whose basename is not `exogen_backend`, since the next steps delete inside it.
2. When `version` is set, `backendPath/.exogen-backend-version` equals `version`, and every file the bundle would copy already exists in `backendPath` with identical content, emit "Backend is up to date." and return. The content check (553 files, about 20 ms) catches an older Git-based app that reset the code with `git reset --hard` but left the untracked marker behind. The dev app passes no `version`, which always syncs, so edits in `backend/` apply on restart.
3. Create `backendPath` when missing.
4. Delete every entry directly under `backendPath` except the protected set, and inside `static/` delete everything except `generated_images/`.
   - Protected: `.venv`, `.cache`, `.git`, `exogen_backend.db*` and any `*.db` (the SQLite file and its sidecars), `*.log` and `logs.txt`.
   - `.git` is kept so that an older app that still pulls with Git can restore its code after a downgrade.
   - The version marker is not protected, so it is deleted here.
5. Copy the source tree into `backendPath` with `fs.cp(..., { recursive: true, force: true })`.
   - The copy skips `.venv`, `.cache`, `.git`, caches, `tests`, `docs`, `openspec`, `*.egg-info`, `static/generated_images`, the version marker, and every protected name.
   - These exclusions cover the whole protected set. So a dev sync never overwrites user logs, and never drops a developer's SQLite journal next to the user's database.
6. When `version` is set, write `.exogen-backend-version` last, so an interrupted sync repeats on the next start. The dev app writes no marker, so a packaged app that shares the same userData always re-syncs its own code.

`startBackend` gains `backendSourcePath` and `appVersion` options, which `electron/main.ts` fills from `app.isPackaged`, `process.resourcesPath`, `app.getAppPath()` and `app.getVersion()`. Its steps become:

1. Python.
2. uv.
3. `ensureGit`. This is the Git check from `clone-backend.ts` with the same install hint, now at error level. `uv sync` still needs Git, because `backend/pyproject.toml` takes `basicsr` from a Git source.
4. `syncBackend`.
5. Venv check.
6. `uv sync`.
7. Run.

`clone-backend.ts`, `git.ts`, `BACKEND_REPO_URL` and `BACKEND_BRANCH` are removed. `BACKEND_DIRNAME` stays `exogen_backend`, so existing installs keep their data in place.

### 4. CI and tooling

- `.github/workflows/backend.yml` runs on pushes and pull requests that touch `backend/**` or the workflow: `uv sync --frozen`, `uv run ruff format --check`, `uv run ruff check`, `uv run ty check`, `uv run pytest --cov=app --cov-report=term`. Every step runs with `working-directory: backend`.
- `.github/workflows/build.yml` adds `!backend/**` as the last entry of both path filters. Its globs (`**/*.json`, `**/*.ts`) would otherwise match backend files, and GitHub applies a negation only after the positive patterns.
- `lint-staged.config.mjs` adds `backend/**/*.py` → `uv run --directory backend ruff format`, `ruff check --fix` and `ty check` on the staged files, replacing the backend's own husky hook.
- `tsconfig.json` excludes `backend`, so `tsc --noEmit` does not walk `backend/.venv`. `.prettierignore` lists `backend/`, so lint-staged's Prettier step leaves backend docs to their own conventions.
- No Dependabot file is added. The old repository had none; security updates stay a repository setting.
- The backend stops releasing on its own. Its version is the app's version.

### 5. After merge

The user archives `andyngdz/exogen_backend` on GitHub after this change lands. Its README gains a note pointing to `exogen/backend/`; branch `release` stays readable, so apps older than this change keep starting.

## Error Handling

- Sync failures emit a `BackendStatusLevel.Error` message naming the failing path and rethrow, so the onboarding backend step shows the failure like any other setup error.
- A missing bundle directory (`sourcePath` not found) is a packaging bug; it emits "Bundled backend not found. Reinstall ExoGen." and stops.

## Testing

- Unit tests for `syncBackend`, against a temp directory:
  - Every protected path, including `.git` and the SQLite journal, survives with its content.
  - Stale code files are removed.
  - The version marker skips a second sync, is written last, and is ignored when bundled code is missing or was reset by an older app.
  - The dev mode always syncs and writes no marker.
  - Dev copies skip `.venv`, `.cache`, the database, its journal and log files.
  - A user's `logs.txt` is not overwritten by a dev source.
  - Wrong target directories and a missing bundle are refused.
  - `ensureGit` passes with Git and stops with the install hint without it.
- `startBackend` tests updated for the new steps and options; `clone-backend` and `git` tests removed.
- Backend: the full `uv run pytest` suite passes from `backend/`.
- Build: `pnpm run build` produces an app whose `resources/backend` holds `main.py`, `app/`, `alembic/`, `alembic.ini`, `pyproject.toml`, `uv.lock`, `.python-version` and `static/styles/`, and none of the excluded paths.
- End to end: the packaged Linux build starts against a copy of an existing `userData/exogen_backend` git clone; after startup, the backend answers `GET /hardware/`, the history list still shows old runs, and `.cache` is unchanged.
