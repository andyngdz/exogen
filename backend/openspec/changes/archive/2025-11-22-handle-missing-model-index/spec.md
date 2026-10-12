# Feature Specification: Handle Missing model_index.json

**Feature Branch**: `008-handle-missing-model-index`
**Created**: 2024-11
**Status**: Completed

## User Scenarios & Testing

### User Story 1 - Download Models Without Index (Priority: P1)

As a user, I want to download models that don't have model_index.json so I can use older/non-standard models.

**Why this priority**: Blocking issue - some valid models can't be downloaded.

**Acceptance Scenarios**:

1. **Given** model without model_index.json, **When** I download, **Then** all repository files are downloaded
2. **Given** model with model_index.json, **When** I download, **Then** only specified components downloaded
3. **Given** malformed model_index.json, **When** I download, **Then** clear error is raised

### Edge Cases

- Repository with partial model_index.json
- Mixed models (some with index, some without)
- Empty repository

## Requirements

### Functional Requirements

- **FR-001**: System MUST catch EntryNotFoundError for missing model_index.json
- **FR-002**: System MUST fallback to downloading all files when index missing
- **FR-003**: System MUST still raise on malformed JSON
- **FR-004**: get_ignore_components MUST work with fallback scopes ['*']

## Success Criteria

### Measurable Outcomes

- **SC-001**: Models without model_index.json download successfully
- **SC-002**: Fallback path has test coverage
- **SC-003**: No regression for models with index
