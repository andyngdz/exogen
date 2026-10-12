# Feature Specification: Fix macOS CUDA Dependencies

**Feature Branch**: `fix/deps-for-macos`
**Created**: 2025-10-25
**Status**: Completed

## User Scenarios & Testing

### User Story 1 - macOS Development Setup (Priority: P1)

As a macOS developer, I want to run `uv sync` without errors so that I can develop and test locally.

**Why this priority**: Blocking issue - macOS developers cannot set up the project at all.

**Acceptance Scenarios**:

1. **Given** macOS ARM64 machine, **When** I run `uv sync`, **Then** dependencies install successfully
2. **Given** macOS setup complete, **When** I run `pytest`, **Then** all tests pass using MPS/CPU backend
3. **Given** Linux/Windows machine, **When** I run `uv sync`, **Then** NVIDIA CUDA packages are installed

### Edge Cases

- CPU fallback when neither CUDA nor MPS available
- Mixed development environments in a team

## Requirements

### Functional Requirements

- **FR-001**: System MUST install dependencies on macOS without CUDA packages
- **FR-002**: System MUST install NVIDIA packages on Linux/Windows
- **FR-003**: System MUST use MPS backend on Apple Silicon
- **FR-004**: System MUST use single `pyproject.toml` for all platforms

## Success Criteria

### Measurable Outcomes

- **SC-001**: `uv sync` succeeds on macOS ARM64
- **SC-002**: All 454 tests pass on macOS
- **SC-003**: CUDA packages installed on Linux/Windows
