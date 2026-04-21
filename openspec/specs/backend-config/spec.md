# Backend Configuration

## Purpose

Backend configuration store for dynamic options like upscalers, fetched at app startup.

## Requirements

### Requirement: Silent Configuration Fetch

The system SHALL fetch configuration from the backend `/config/` endpoint silently during app initialization.

#### Scenario: Config fetched on startup

- **WHEN** backend initialization completes
- **THEN** the backend configuration is fetched silently in the background

### Requirement: Centralized Store

The system SHALL store the fetched configuration in a centralized store accessible across all components.

#### Scenario: Config accessible via hook

- **WHEN** any component needs config data
- **THEN** it can access it through the `useConfig()` hook

### Requirement: Upscaler Configuration

The system SHALL make upscaler configuration available with all fields (value, name, description, suggested_denoise_strength, method, is_recommended).

#### Scenario: Upscaler options in dropdown

- **WHEN** user opens the hires fix upscaler dropdown
- **THEN** options from backend config are displayed (traditional: Lanczos, Bicubic, Bilinear, Nearest; AI: Real-ESRGAN variants)

#### Scenario: Recommended upscalers indicated

- **WHEN** user opens the hires fix upscaler dropdown
- **THEN** upscalers with `is_recommended: true` display a "Recommended" chip

#### Scenario: Method categorization available

- **WHEN** upscaler config is loaded
- **THEN** each upscaler has a method field indicating `"traditional"` or `"ai"`

#### Scenario: Upscalers grouped by method

- **WHEN** user opens the hires fix upscaler dropdown
- **THEN** upscalers are grouped into sections by method ("Traditional" and "AI")

### Requirement: Immediate Form Display

The system SHALL display Hires.fix form immediately using persisted Zustand values (no loading state required).

#### Scenario: Form displays without delay

- **WHEN** user clicks the Hires.fix checkbox
- **THEN** the form appears immediately using Zustand store values

### Requirement: First-Time Defaults

The system SHALL use backend config values only as initial defaults for new/unpopulated form fields.

#### Scenario: Fresh installation defaults

- **WHEN** a new user opens Hires.fix settings for the first time
- **THEN** form is populated with backend-provided defaults

### Requirement: User Preference Preservation

The system SHALL preserve user-modified form values in Zustand and NOT overwrite them with backend config on subsequent loads.

#### Scenario: User changes persist

- **WHEN** user has modified form values and app restarts
- **THEN** user's modified values are preserved

#### Scenario: Backend changes don't override

- **WHEN** backend config changes
- **THEN** existing user preferences remain unchanged

### Requirement: Null-Safe Config Hook

The system SHALL provide a `useConfig()` wrapper hook that returns config with default empty arrays, eliminating null-checking in consuming components.

#### Scenario: Empty array defaults

- **WHEN** config is not yet loaded
- **THEN** `useConfig()` returns `{ upscalers: [] }`

## Key Entities

- **Backend Configuration**: Root config object from API with available options and defaults
- **UpscalerMethod** (enum): `TRADITIONAL = 'traditional'`, `AI = 'ai'`
- **Upscaler**: value (identifier), name (display name), description (help text), suggested_denoise_strength, method (UpscalerMethod enum), is_recommended (boolean)
- **Form State (Zustand)**: User's persisted form values that take precedence over backend defaults
