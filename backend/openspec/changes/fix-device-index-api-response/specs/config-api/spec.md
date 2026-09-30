## MODIFIED Requirements

### Requirement: Device Index Validation

The system SHALL return the raw device index from the database without validation in `get_device_index()`. Invalid device handling is deferred to consumers that require a valid index.

#### Scenario: No config exists (first setup)

- **WHEN** `get_device_index` is called
- **AND** no config exists in the database
- **THEN** the function returns `DeviceSelection.NOT_FOUND` (-2)

#### Scenario: Device index is stored

- **WHEN** `get_device_index` is called
- **AND** a config exists with a device_index value
- **THEN** the function returns the stored device_index as-is

## ADDED Requirements

### Requirement: Memory Service Invalid Device Handling

The system SHALL handle invalid device indices gracefully in `MemoryService` to prevent crashes when querying GPU properties.

#### Scenario: Negative device index

- **WHEN** `MemoryService` is initialized
- **AND** the device_index from config is negative (e.g., -2 or -1)
- **THEN** `total_gpu` is set to 0
- **AND** no call to `torch.cuda.get_device_properties()` is made

#### Scenario: Valid device index on CUDA

- **WHEN** `MemoryService` is initialized
- **AND** the device is CUDA
- **AND** the device_index is non-negative
- **THEN** `total_gpu` is set from `torch.cuda.get_device_properties(device_index).total_memory`
