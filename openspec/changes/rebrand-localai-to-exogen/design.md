# Design: Rebrand LocalAI to ExoGen

## Context

The project is undergoing a complete rebrand from "LocalAI" to "ExoGen". The GitHub repositories have already been renamed:

- `https://github.com/andyngdz/localai` → `https://github.com/andyngdz/exogen`
- `https://github.com/andyngdz/localai_backend` → `https://github.com/andyngdz/exogen_backend`

This design document maps all locations requiring updates to ensure consistent branding.

## Goals / Non-Goals

**Goals:**

- Update all user-facing text from "LocalAI" to "ExoGen"
- Update all repository URLs and references
- Update package/app identifiers
- Maintain all existing functionality (no behavioral changes)

**Non-Goals:**

- Logo file replacement (out of scope - logo.png stays, only import alias renamed)
- Domain or hosting changes
- Backend code changes (separate repository)

## File Change Mapping

### 1. Package Configuration

| File              | Field          | Old Value     | New Value    |
| ----------------- | -------------- | ------------- | ------------ |
| `package.json:2`  | name           | `"localai"`   | `"exogen"`   |
| `package.json:3`  | description    | `"LocalAI"`   | `"ExoGen"`   |
| `package.json:13` | repository.url | `localai.git` | `exogen.git` |

### 2. Electron Builder Configuration

| File                       | Field        | Old Value            | New Value           |
| -------------------------- | ------------ | -------------------- | ------------------- |
| `electron-builder.yaml:1`  | appId        | `dev.andyng.localai` | `dev.andyng.exogen` |
| `electron-builder.yaml:2`  | productName  | `LocalAI`            | `ExoGen`            |
| `electron-builder.yaml:20` | publish.repo | `localai`            | `exogen`            |

### 3. SonarQube Configuration

| File                         | Field       | Old Value          | New Value         |
| ---------------------------- | ----------- | ------------------ | ----------------- |
| `sonar-project.properties:1` | projectKey  | `andyngdz_localai` | `andyngdz_exogen` |
| `sonar-project.properties:5` | projectName | `LocalAI`          | `ExoGen`          |

### 4. Source Code - UI Text

| File                                                                      | Location     | Old Value                 | New Value                |
| ------------------------------------------------------------------------- | ------------ | ------------------------- | ------------------------ |
| `src/app/layout.tsx:20`                                                   | title        | `'LocalAI'`               | `'ExoGen'`               |
| `src/features/app-footer/presentations/AppFooter.tsx:9`                   | copyright    | `LocalAI`                 | `ExoGen`                 |
| `src/features/health-check/presentations/HealthCheck.tsx:36`              | description  | `LocalAI backend server`  | `ExoGen backend server`  |
| `src/features/gpu-detection/presentations/GpuDetectionCpuModeOnly.tsx:16` | text         | `LocalAI will run on CPU` | `ExoGen will run on CPU` |
| `src/features/editors/presentations/EditorNavbar.tsx:1`                   | import alias | `LocalAILogo`             | `ExoGenLogo`             |
| `src/features/editors/presentations/EditorNavbar.tsx:13`                  | alt text     | `LocalAI Logo`            | `ExoGen Logo`            |

### 5. Backend Scripts

| File                                  | Location         | Old Value                         | New Value                        |
| ------------------------------------- | ---------------- | --------------------------------- | -------------------------------- |
| `scripts/backend/constants.ts:1`      | BACKEND_REPO_URL | `localai_backend.git`             | `exogen_backend.git`             |
| `scripts/backend/constants.ts:3`      | BACKEND_DIRNAME  | `localai_backend`                 | `exogen_backend`                 |
| `scripts/backend/run-backend.ts:59`   | message          | `Starting LocalAI Backend`        | `Starting ExoGen Backend`        |
| `scripts/backend/run-backend.ts:64`   | message          | `LocalAI Backend is starting`     | `ExoGen Backend is starting`     |
| `scripts/backend/run-backend.ts:94`   | error            | `Failed to start LocalAI Backend` | `Failed to start ExoGen Backend` |
| `scripts/backend/run-backend.ts:97`   | error            | `Failed to start LocalAI Backend` | `Failed to start ExoGen Backend` |
| `scripts/backend/clone-backend.ts:41` | message          | `Cloning LocalAI backend`         | `Cloning ExoGen backend`         |
| `scripts/backend/start-backend.ts:37` | comment          | `LocalAI Backend`                 | `ExoGen Backend`                 |

### 6. Test Files

| File                                                                                  | Updates Required         |
| ------------------------------------------------------------------------------------- | ------------------------ |
| `src/app/__tests__/layout.test.tsx`                                                   | title assertion          |
| `src/features/health-check/presentations/__tests__/HealthCheck.test.tsx`              | description assertion    |
| `src/features/gpu-detection/presentations/__tests__/GpuDetectionCpuModeOnly.test.tsx` | text assertions (2)      |
| `src/features/editors/presentations/__tests__/EditorNavbar.test.tsx`                  | alt text assertion       |
| `scripts/backend/__tests__/run-backend.test.ts`                                       | message assertions (~15) |
| `scripts/backend/__tests__/clone-backend.test.ts`                                     | message assertions (2)   |

### 7. Documentation

| File                  | Updates Required                                           |
| --------------------- | ---------------------------------------------------------- |
| `README.md`           | All "LocalAI" → "ExoGen", all repo URLs                    |
| `AGENTS.md`           | Title "Agent Guide for LocalAI" → "Agent Guide for ExoGen" |
| `openspec/project.md` | Project description                                        |

### 8. OpenSpec Files (Historical Context)

The following OpenSpec files contain "LocalAI" references. These are historical records and should be updated to maintain consistency:

- `openspec/specs/auto-update/spec.md`
- `openspec/changes/update-backend-starting-message/` (multiple files)
- `openspec/changes/update-readme-documentation/specs/documentation/spec.md`
- `openspec/changes/archive/` (various historical files)

## Risks / Trade-offs

| Risk                                      | Mitigation                                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| Breaking backend clone for existing users | Users with existing `localai_backend` directory will need to delete it or manually rename |
| SonarQube history loss                    | New project key means fresh analysis history                                              |
| Electron app upgrade path                 | macOS may treat as new app; users may need to re-grant permissions                        |

## Migration Plan

1. Implement all code changes in a single PR
2. Run full test suite to verify no regressions
3. Build and test Electron app on all platforms
4. Tag release with new branding
5. Update GitHub repository settings if not already done

## Open Questions

None - the user has confirmed the repository renames are complete.
