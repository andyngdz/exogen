# Tasks: Rebrand LocalAI to ExoGen

## 0. Git Configuration

- [x] 0.1 Update git remote origin URL from `localai.git` to `exogen.git`

## 1. Package Configuration

- [x] 1.1 Update `package.json` name from `localai` to `exogen`
- [x] 1.2 Update `package.json` description from `LocalAI` to `ExoGen`
- [x] 1.3 Update `package.json` repository URL from `localai.git` to `exogen.git`

## 2. Electron Builder Configuration

- [x] 2.1 Update `electron-builder.yaml` appId from `dev.andyng.localai` to `dev.andyng.exogen`
- [x] 2.2 Update `electron-builder.yaml` productName from `LocalAI` to `ExoGen`
- [x] 2.3 Update `electron-builder.yaml` publish.repo from `localai` to `exogen`

## 3. SonarQube Configuration

- [x] 3.1 Update `sonar-project.properties` projectKey from `andyngdz_localai` to `andyngdz_exogen`
- [x] 3.2 Update `sonar-project.properties` projectName from `LocalAI` to `ExoGen`

## 4. Source Code - UI Components

- [x] 4.1 Update `src/app/layout.tsx` page title from `LocalAI` to `ExoGen`
- [x] 4.2 Update `src/app/__tests__/layout.test.tsx` title assertion
- [x] 4.3 Update `src/features/app-footer/presentations/AppFooter.tsx` copyright text
- [x] 4.4 Update `src/features/health-check/presentations/HealthCheck.tsx` description
- [x] 4.5 Update `src/features/health-check/presentations/__tests__/HealthCheck.test.tsx` assertion
- [x] 4.6 Update `src/features/gpu-detection/presentations/GpuDetectionCpuModeOnly.tsx` text
- [x] 4.7 Update `src/features/gpu-detection/presentations/__tests__/GpuDetectionCpuModeOnly.test.tsx` assertions
- [x] 4.8 Update `src/features/editors/presentations/EditorNavbar.tsx` import alias and alt text
- [x] 4.9 Update `src/features/editors/presentations/__tests__/EditorNavbar.test.tsx` assertion

## 5. Backend Scripts

- [x] 5.1 Update `scripts/backend/constants.ts` BACKEND_REPO_URL to `exogen_backend.git`
- [x] 5.2 Update `scripts/backend/constants.ts` BACKEND_DIRNAME to `exogen_backend`
- [x] 5.3 Update `scripts/backend/run-backend.ts` all "LocalAI Backend" messages to "ExoGen Backend"
- [x] 5.4 Update `scripts/backend/clone-backend.ts` message to "Cloning ExoGen backend"
- [x] 5.5 Update `scripts/backend/start-backend.ts` comment
- [x] 5.6 Update `scripts/backend/__tests__/run-backend.test.ts` all message assertions
- [x] 5.7 Update `scripts/backend/__tests__/clone-backend.test.ts` message assertions

## 6. Documentation

- [x] 6.1 Update `README.md` all "LocalAI" references to "ExoGen"
- [x] 6.2 Update `README.md` all repository URLs from `localai` to `exogen`
- [x] 6.3 Update `AGENTS.md` title from "Agent Guide for LocalAI" to "Agent Guide for ExoGen"
- [x] 6.4 Update `openspec/project.md` project description

## 7. OpenSpec Files

- [x] 7.1 Update `openspec/specs/auto-update/spec.md` LocalAI reference
- [x] 7.2 Update relevant OpenSpec change files with LocalAI references

## 8. Verification

- [x] 8.1 Run `pnpm run type-check` to verify no TypeScript errors
- [x] 8.2 Run `pnpm test` to verify all tests pass
- [x] 8.3 Run `pnpm run lint` to verify linting passes
- [x] 8.4 Run `pnpm run build` to verify build succeeds (skipped - requires full build environment)
