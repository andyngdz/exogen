# Feature Specification: Fix Download Size Bloat

**Feature Branch**: `90-download-model-file-is-too-large`
**Created**: 2024-11
**Status**: Completed
**Issue**: #90

## User Scenarios & Testing

### User Story 1 - Accurate Download Size (Priority: P1)

As a user, I want the actual download size to match what the UI promises so I don't waste bandwidth and storage.

**Why this priority**: Critical UX issue - users reported 3x larger downloads than advertised.

**Acceptance Scenarios**:

1. **Given** UI shows 4.3 GB for SD 1.5, **When** I download, **Then** actual download is ~4.3 GB
2. **Given** model with duplicate formats, **When** downloading, **Then** only .safetensors files are downloaded
3. **Given** model with fp16/non_ema variants, **When** downloading, **Then** variants are filtered out

### User Story 2 - Model Loader Compatibility (Priority: P1)

As a system, I must load models correctly after bloat filtering so functionality is preserved.

**Acceptance Scenarios**:

1. **Given** downloaded model (standard only), **When** loading, **Then** model loads successfully
2. **Given** model without .safetensors, **When** downloading, **Then** .bin files are kept

### Edge Cases

- Models with only .bin files (no .safetensors) - keep .bin
- Models with only fp16 variants (no standard) - keep fp16
- Older models with different naming conventions

## Requirements

### Functional Requirements

- **FR-001**: System MUST filter duplicate .bin files when .safetensors exists
- **FR-002**: System MUST filter fp16, non_ema, ema_only variants
- **FR-003**: Model loader MUST try standard formats before variants
- **FR-004**: System MUST preserve functionality for edge case models

## Success Criteria

### Measurable Outcomes

- **SC-001**: SD 1.5 download reduced from 15 GB to 4.27 GB (71% reduction)
- **SC-002**: UI promise matches actual download size
- **SC-003**: All 53 tests passing (30 download + 23 loader)
- **SC-004**: Zero breaking changes to existing functionality
