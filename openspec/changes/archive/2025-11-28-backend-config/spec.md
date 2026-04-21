# Feature Specification: Backend Configuration Store

**Feature Branch**: `009-backend-config`
**Created**: 2025-11-28
**Status**: Complete (Implementation & Tests Done)
**Input**: User description: "Fetch backend config API on app start and store in Zustand for cross-app usage. The config includes upscalers with value, name, description, and suggested_denoise_strength fields."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Dynamic Upscaler Options (Priority: P1)

When a user opens the High-Resolution Fix settings, they see upscaler options that are dynamically loaded from the backend configuration rather than hardcoded values. The form displays immediately because form values are already persisted in Zustand.

**Why this priority**: This is the core value of the feature - enabling the backend to control available options and their metadata (like suggested denoise strength) without requiring frontend code changes.

**Independent Test**: Can be fully tested by starting the app, navigating to hires fix settings, and verifying the upscaler dropdown displays options from the backend API response.

**Acceptance Scenarios**:

1. **Given** the app is starting up, **When** the backend initialization completes, **Then** the backend configuration is fetched silently in the background.

2. **Given** the user clicks the Hires.fix checkbox, **When** the form appears, **Then** it displays immediately using values from the Zustand store (no loading delay).

3. **Given** the backend configuration has loaded, **When** the user opens the hires fix upscaler dropdown, **Then** they see upscaler options matching the backend response (Lanczos, Bicubic, Bilinear, Nearest) with their display names.

---

### User Story 2 - First-Time Default Values (Priority: P2)

Backend configuration provides initial/default values for new users or fresh installations. Once a user modifies values, their preferences are persisted in Zustand and take precedence over backend defaults.

**Why this priority**: Ensures user preferences are respected while still allowing backend to control sensible defaults.

**Independent Test**: Modify upscaler selection, restart app, verify user's selection persists and is not overwritten by backend config.

**Acceptance Scenarios**:

1. **Given** a fresh installation with no persisted form state, **When** the user opens Hires.fix settings for the first time, **Then** the form is populated with backend-provided default values (e.g., suggested_denoise_strength).

2. **Given** the user has previously modified form values, **When** the app restarts, **Then** the user's modified values are preserved and NOT overwritten by backend configuration.

3. **Given** the user has persisted preferences, **When** backend config changes, **Then** existing user preferences remain unchanged.

---

### User Story 3 - Configuration Extensibility (Priority: P3)

The configuration system supports additional config types beyond upscalers, allowing future backend-controlled settings to be added without significant refactoring.

**Why this priority**: Important for maintainability but not required for MVP functionality.

**Independent Test**: Can be tested by adding a new config type to the backend response and verifying it can be accessed through the same store pattern.

**Acceptance Scenarios**:

1. **Given** the backend returns additional configuration fields (beyond upscalers), **When** those fields are accessed in the frontend, **Then** they are available through the configuration store.

---

### Edge Cases

- How does the system behave if configuration fetch takes longer than expected? → No impact; form uses persisted Zustand values immediately.
- What if backend returns empty upscalers array? → Component renders empty dropdown (edge case unlikely in practice).

**Out of Scope**: Fallback handling for backend failures. The local backend is always available; if it crashes, the entire app is unusable anyway (YAGNI principle).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST fetch configuration from the backend `/config/` endpoint silently during app initialization.
- **FR-002**: System MUST store the fetched configuration in a centralized store accessible across all components.
- **FR-003**: System MUST make upscaler configuration available with all fields (value, name, description, suggested_denoise_strength).
- **FR-004**: System MUST display Hires.fix form immediately using persisted Zustand values (no loading state required).
- **FR-005**: System MUST use backend config values only as initial defaults for new/unpopulated form fields.
- **FR-006**: System MUST preserve user-modified form values in Zustand and NOT overwrite them with backend config on subsequent loads.
- **FR-007**: System MUST provide a `useConfig()` wrapper hook that returns config with default empty arrays, eliminating null-checking in consuming components.

### Key Entities

- **Backend Configuration**: The root configuration object returned by the API, containing available options and suggested defaults.
- **Upscaler**: A configuration item representing an image upscaling method, with properties: value (identifier), name (display name), description (help text), and suggested_denoise_strength (recommended default value for first-time use).
- **Form State (Zustand)**: User's persisted form values that take precedence over backend defaults once modified.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Hires.fix form displays immediately when checkbox is clicked (no loading delay).
- **SC-002**: User-modified values persist across app restarts and are never overwritten by backend config.
- **SC-003**: Adding new configuration types to the backend response requires only adding a field to the `useConfig()` hook return type.

## Clarifications

### Session 2025-11-28

- Q: What retry behavior should be applied when backend config fetch fails? → A: Use TanStack Query's built-in retry mechanism (default: 3 retries with exponential backoff).
- Q: Should config loading show UI indicators? → A: No, load silently in background. Form displays immediately using Zustand-persisted values.
- Q: How should backend config interact with user-modified form values? → A: Backend config provides first-time defaults only. User modifications are persisted in Zustand and always take precedence.
- Q: Should we implement fallback defaults for config fetch failures? → A: No. Local backend is always available; if it crashes, entire app is unusable. Fallback handling is over-engineering (YAGNI).
- Q: How should components consume the config? → A: Via a `useConfig()` wrapper hook that returns `{ upscalers: [] }` with default empty arrays, eliminating null-checking in components.
- Q: Should we use destructuring defaults (`{ data = { upscalers: [] } }`) or nullish coalescing (`??`) for default values? → A: Use nullish coalescing (`data?.upscalers ?? []`) - it handles both undefined data AND missing fields, and is more extensible for future config fields.
- Q: When should `suggested_denoise_strength` be applied on upscaler change? → A: Apply every time user changes upscaler IF there is no existing config from localStorage (first-time user). Update `useGeneratorConfigFormats.ts` to use backend config instead of hardcoded values.
- Q: How should default upscaler be obtained in `useGeneratorConfigFormats`? → A: Use `first(upscalers)` from es-toolkit inside `onHiresFixToggle` function. This keeps the logic localized and only computes default when needed.
- Q: Tests completed for this feature? → A: Yes. Tests added for `useConfig` hook, `GeneratorConfigHiresFixUpscaler`, `useGeneratorConfigFormats`, and updated existing tests to mock the new `useConfig` dependency. All 1340 tests pass.

## Assumptions

- The backend `/config/` endpoint is available at the same base URL as other API endpoints.
- The configuration data structure is stable and follows the schema provided (upscalers array with value, name, description, suggested_denoise_strength fields).
- Configuration can be fetched once at app startup and doesn't need real-time updates during a session.
- Local backend is always running and available (Electron app bundles frontend + backend together).
- Hires.fix form state is already persisted in Zustand store (existing functionality).
