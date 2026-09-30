# Tasks: Merge The Backend Into This Repository

Dependency levels: unit 1 is level 0; units 2, 3 and 4 are level 1; unit 5 is level 2; unit 6 is level 3. Units at the same level with disjoint `writes` are `parallel-safe`.

## 1. Import With History [depends-on: -] [writes: backend/] [parallel-safe: no]

- [ ] `git subtree add --prefix=backend https://github.com/andyngdz/exogen_backend.git main`.
- [ ] Remove `backend/package.json`, `backend/pnpm-lock.yaml`, `backend/.releaserc.json`, `backend/.husky/` and `backend/.github/` in a follow-up commit.
- [ ] Confirm `git log --follow backend/main.py` shows backend history, and `uv sync --frozen && uv run pytest` passes in `backend/`.

## 2. Sync Replaces Clone [depends-on: 1] [writes: scripts/backend/, electron/main.ts] [parallel-safe: yes]

- [ ] Add `syncBackend` with the protected set, the version marker written last, the dev always-sync path, and dev copy exclusions.
- [ ] Wire it into `startBackend` with `sourcePath` and `version` from `electron/main.ts`.
- [ ] Remove `clone-backend.ts`, `git.ts`, `BACKEND_REPO_URL`, `BACKEND_BRANCH` and their tests.
- [ ] Unit tests cover:
  - Protected paths.
  - Stale file removal.
  - `.git` removal.
  - Version skip.
  - Marker ordering.
  - Dev always-sync and dev copy exclusions.
  - The missing bundle error.

## 3. Bundle In The App [depends-on: 1] [writes: electron-builder.yaml] [parallel-safe: yes]

- [ ] Add the `extraResources` entry with the exclusion filter.

## 4. CI And Tooling [depends-on: 1] [writes: .github/workflows/backend.yml, .github/workflows/build.yml, .github/dependabot.yml, lint-staged.config.mjs] [parallel-safe: yes]

- [ ] Add `backend.yml`: uv, ruff format check, ruff check, ty, pytest with coverage, SonarCloud with `projectBaseDir: backend`.
- [ ] Exclude `backend/**` from `build.yml` path filters.
- [ ] Add backend Python checks to lint-staged.
- [ ] Add the `uv` Dependabot entry for `/backend`.

## 5. Docs [depends-on: 2, 3, 4] [writes: README.md, docs/, AGENTS.md] [parallel-safe: no]

- [ ] Update the README and docs for the repository layout, backend development (`cd backend && uv run uvicorn main:app`), and removing Git as a requirement.
- [ ] Draft the pointer note for the old repository's README, for the user to apply before archiving.

## 6. Verification [depends-on: 5] [writes: -] [parallel-safe: no]

- [ ] Run `openspec validate merge-backend-into-monorepo --strict`.
- [ ] Run `pnpm run lint`, `pnpm run type-check` and `pnpm test`; run `uv run ruff check`, `uv run ty check` and `uv run pytest` in `backend/`.
- [ ] Run `pnpm run build`, and list `resources/backend` in the Linux output to confirm the included and excluded paths.
- [ ] Start the packaged Linux app against a copy of an existing `userData/exogen_backend` clone. Confirm `GET /hardware/` answers, old history shows, and `.cache` is unchanged (file count and size before and after).
- [ ] Open the pull request with a note that it must be merged with "Create a merge commit".
