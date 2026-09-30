# Model Manager

## Purpose

Core model lifecycle management with state machine, resource cleanup, and cancellation support.

## Requirements

### Requirement: State Machine

The system SHALL manage model state transitions (IDLE → LOADING → LOADED → UNLOADING → IDLE).

#### Scenario: Load model from idle

- **WHEN** load is requested from IDLE state
- **THEN** state transitions to LOADING

#### Scenario: Model loaded successfully

- **WHEN** model loading completes
- **THEN** state transitions to LOADED

#### Scenario: Unload model

- **WHEN** unload is requested from LOADED state
- **THEN** state transitions to UNLOADING then IDLE

### Requirement: Resource Cleanup

The system SHALL clean up GPU/MPS resources on unload.

#### Scenario: GPU memory released

- **WHEN** model is unloaded
- **THEN** GPU memory is freed via torch.cuda.empty_cache()

#### Scenario: MPS memory released

- **WHEN** model is unloaded on macOS
- **THEN** MPS memory is freed via torch.mps.empty_cache()

### Requirement: Cancellation Handling

The system SHALL handle cancellation without resource leaks.

#### Scenario: Cancel during loading

- **WHEN** new model requested during loading
- **THEN** current load is cancelled cleanly

#### Scenario: No resource leaks on cancel

- **WHEN** load is cancelled
- **THEN** all allocated resources are freed

### Requirement: Property-Based API

The system SHALL expose property-based API for state access.

#### Scenario: Access current state

- **WHEN** accessing model_manager.current_state
- **THEN** current state is returned without method call

#### Scenario: Access sample size

- **WHEN** accessing model_manager.sample_size
- **THEN** sample size is returned as property

### Requirement: ThreadPoolExecutor Management

The system SHALL provide ThreadPoolExecutor lifecycle management.

#### Scenario: Executor cleanup on shutdown

- **WHEN** application shuts down
- **THEN** ThreadPoolExecutor is properly terminated

## Key Entities

- **StateManager**: State machine with valid transitions
- **LoaderService**: Async orchestration with cancellation
- **PipelineManager**: Pipeline storage and configuration
- **ResourceManager**: GPU/MPS memory cleanup
