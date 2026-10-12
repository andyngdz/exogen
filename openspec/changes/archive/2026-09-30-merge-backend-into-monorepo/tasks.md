# Tasks: Merge The Backend Into This Repository

Dependency levels: unit 1 is level 0; units 2, 3 and 4 are level 1; unit 5 is level 2; unit 6 is level 3. Units at the same level with disjoint `writes` are `parallel-safe`.

## 1. Import With History [depends-on: -] [writes: backend/] [parallel-safe: no]

- [x] `git subtree add --prefix=backend https://github.com/andyngdz/exogen_backend.git main`.
- [x] Remove `backend/package.json`, `backend/pnpm-lock.yaml`, `backend/.releaserc.json`, `backend/.husky/` and `backend/.github/` in a follow-up commit, and stop tracking `backend/exogen_backend.egg-info` (rewritten by every `uv sync`).
- [x] Confirm `git blame backend/main.py` attributes lines to former backend commits (`git log --follow` does not cross a subtree merge), and `uv sync --frozen && uv run pytest` passes in `backend/`.

## 2. Sync Replaces Clone [depends-on: 1] [writes: scripts/backend/, electron/main.ts] [parallel-safe: yes]

- [x] Add `syncBackend` with:
  - The protected set, including `.git` and SQLite sidecars.
  - Copy exclusions that cover the protected set.
  - The version marker, written last.
  - The bundle content check behind the marker.
  - The dev always-sync path.
- [x] Move the Git check into an `ensureGit` step before the sync, and wire `syncBackend` into `startBackend` with `backendSourcePath` and `appVersion` from `electron/main.ts`.
- [x] Remove `clone-backend.ts`, `git.ts`, `BACKEND_REPO_URL`, `BACKEND_BRANCH` and their tests.
- [x] Unit tests cover:
  - Protected paths.
  - Stale file removal.
  - `.git` removal.
  - Version skip.
  - Marker ordering.
  - Dev always-sync and dev copy exclusions.
  - The missing bundle error.

## 3. Bundle In The App [depends-on: 1] [writes: electron-builder.yaml] [parallel-safe: yes]

- [x] Add the `extraResources` entry with the exclusion filter.

## 4. CI And Tooling [depends-on: 1] [writes: .github/workflows/backend.yml, .github/workflows/build.yml, lint-staged.config.mjs, tsconfig.json, .prettierignore] [parallel-safe: yes]

- [x] Add `backend.yml`: uv, ruff format check, ruff check, ty, pytest with coverage. (SonarCloud was dropped from the repository after merge.)
- [x] Exclude `backend/**` from `build.yml` path filters, as the last entry.
- [x] Add backend Python checks to lint-staged.
- [x] Exclude `backend` from `tsconfig.json` and Prettier.

## 5. Docs [depends-on: 2, 3, 4] [writes: README.md, docs/, AGENTS.md] [parallel-safe: no]

- [x] Update the README and docs for the repository layout, backend development (`cd backend && uv run uvicorn main:app`), and removing Git as a requirement.
- [x] Draft the pointer note for the old repository's README, for the user to apply before archiving.

## 6. Verification [depends-on: 5] [writes: -] [parallel-safe: no]

- [x] Run `openspec validate merge-backend-into-monorepo --strict`.
- [x] Run `pnpm run lint`, `pnpm run type-check` and `pnpm test`; run `uv run ruff format --check`, `uv run ruff check`, `uv run ty check` and `uv run pytest` in `backend/`.
- [x] Run `pnpm run build`, and list `resources/backend` in the Linux output to confirm the included and excluded paths.
- [x] Start the packaged Linux app against a copy of an existing `userData/exogen_backend` clone. Confirm `GET /hardware/` answers, old history shows, and `.cache` is unchanged (file count and size before and after).
- [x] Open the pull request with a note that it must be merged with "Create a merge commit".
