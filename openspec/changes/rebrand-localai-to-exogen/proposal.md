# Change: Rebrand LocalAI to ExoGen

## Why

The project is being rebranded from "LocalAI" to "ExoGen". This includes renaming the GitHub repositories from `localai`/`localai_backend` to `exogen`/`exogen_backend`, and updating all references throughout the codebase to reflect the new brand identity.

## What Changes

- **Package identity**: Update `package.json` name and description
- **Electron app identity**: Update app ID, product name, and GitHub repo reference in `electron-builder.yaml`
- **UI text**: Update all user-facing "LocalAI" strings to "ExoGen" (health check, GPU detection, footer, page title, navbar)
- **Backend references**: Update repository URL and directory name for `exogen_backend`
- **Backend messages**: Update all "LocalAI Backend" status messages
- **Documentation**: Update README.md, AGENTS.md, and OpenSpec project.md
- **External config**: Update SonarQube project configuration

## Impact

- Affected specs: None (this is a naming/branding change only, no behavioral changes)
- Affected code:
  - `package.json` - package name and description
  - `electron-builder.yaml` - app ID, product name, repo
  - `sonar-project.properties` - project key and name
  - `src/app/layout.tsx` - page title
  - `src/features/app-footer/presentations/AppFooter.tsx` - copyright
  - `src/features/health-check/presentations/HealthCheck.tsx` - status text
  - `src/features/gpu-detection/presentations/GpuDetectionCpuModeOnly.tsx` - description
  - `src/features/editors/presentations/EditorNavbar.tsx` - logo import alias and alt text
  - `scripts/backend/constants.ts` - repo URL and directory name
  - `scripts/backend/run-backend.ts` - status messages
  - `scripts/backend/clone-backend.ts` - status message
  - `scripts/backend/start-backend.ts` - comment
  - All corresponding test files
  - Documentation files (README.md, AGENTS.md, openspec/project.md)
  - OpenSpec spec and change files referencing LocalAI
