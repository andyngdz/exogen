# Proposal: Merge The Backend Into This Repository

## Change ID

`merge-backend-into-monorepo`

## Summary

Move `andyngdz/exogen_backend` into this repository as `backend/` with its full history, and ship it inside the app instead of cloning it from GitHub at runtime. The backend keeps running as its own Python process under uv.

## Why

- Frontend and backend changes that belong together (for example `GET /hardware/memory` for the redesigned status bar) need two pull requests, two reviews and a merge order today.
- The app clones branch `release` of `exogen_backend` on every start, so the backend version a user runs is not tied to the app version they installed.

## What Changes

- Add `backend/` with `git subtree add`, keeping all 558 backend commits.
- Drop the backend's own Node tooling (`package.json`, `pnpm-lock.yaml`, `.releaserc.json`, `.husky/`) and move its CI into this repository's `.github/`.
- Bundle `backend/` into the app's resources with electron-builder, excluding environments, caches, tests and user data.
- Replace `cloneBackend` with `syncBackend`: copy the bundled code into the existing `userData/exogen_backend` directory when the app version changes, never touching the models, virtual environment, database or generated images stored there. Git stays required, because `uv sync` fetches `basicsr` from a Git source; the check moves into its own `ensureGit` step.
- Add a backend CI workflow (uv, ruff, ty, pytest with coverage, SonarCloud project `andyngdz_exogen_backend`) and backend lint-staged checks, and keep `backend/` out of the frontend's TypeScript and Prettier runs.

## Non-Goals

- Moving backend data out of the backend directory, or changing any backend runtime path.
- Merging `backend/openspec/` into the root `openspec/`.
- Packaging Python itself or the virtual environment into the app.
- The paused 1b redesign (`redesign-generator-shell`).

## Impact

- New: `backend/` (the former repository), `.github/workflows/backend.yml`, `.prettierignore`.
- Changed: `scripts/backend/` (clone replaced by sync, Git helpers removed), `electron/main.ts`, `electron-builder.yaml`, `lint-staged.config.mjs`, `tsconfig.json`, `.github/workflows/build.yml`, `README.md`, `docs/`.
- New OpenSpec capability: `backend-distribution`.

## Risks / Mitigations

- **Deleting user data during sync**: the sync removes only paths outside a fixed protected list, and tests cover every protected path plus an existing git clone as the starting state.
- **Squash merge would flatten the imported history**: the pull request states that it must land with "Create a merge commit".
- **Installed apps on older versions still clone `exogen_backend` branch `release`**: that branch stays readable after the repository is archived.
- **Downgrading to an app that still clones**: the sync keeps `.git`, so the older app's `fetch` and `reset --hard` restore its code instead of telling the user to delete the directory with their models in it.
