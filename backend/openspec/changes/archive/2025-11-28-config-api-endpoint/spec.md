# Feature Specification: Config API Endpoint

**Feature Branch**: `124-create-config-api-to-share-config-with-frontend`
**Created**: 2024-11
**Status**: Completed

## User Scenarios & Testing

### User Story 1 - Get Upscaler Options (Priority: P1)

As frontend, I want to fetch upscaler options with metadata so I can display them to users with descriptions.

**Why this priority**: Frontend needs config data without hardcoding.

**Acceptance Scenarios**:

1. **Given** GET /config, **When** request succeeds, **Then** I get list of upscalers with value, name, description
2. **Given** upscaler item, **When** I read it, **Then** suggested_denoise_strength is provided

### Edge Cases

- Extensibility for future config items

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide GET /config endpoint
- **FR-002**: Response MUST include upscalers with value, name, description, suggested_denoise_strength
- **FR-003**: Schema MUST be extensible for future config items

### Key Entities

- **UpscalerItem**: value, name, description, suggested_denoise_strength
- **ConfigResponse**: upscalers list

## Success Criteria

### Measurable Outcomes

- **SC-001**: GET /config returns 200 with upscaler data
- **SC-002**: All 4 upscaler types included with metadata
- **SC-003**: Tests cover service and API layer
