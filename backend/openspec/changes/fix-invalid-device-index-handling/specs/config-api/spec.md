## ADDED Requirements

### Requirement: Device Index Validation

The system SHALL validate the device index when retrieving it from the database via `get_device_index`.

#### Scenario: No config exists (first setup)

- **WHEN** `get_device_index` is called
- **AND** no config exists in the database
- **THEN** the function returns the current active device index (`device_service.current_device`)
- **AND** logs a warning: "Invalid device index, falling back to device {index}"

#### Scenario: Device index is NOT_FOUND

- **WHEN** `get_device_index` is called
- **AND** the stored device_index equals `DeviceSelection.NOT_FOUND`
- **THEN** the function returns the current active device index
- **AND** logs a warning: "Invalid device index, falling back to device {index}"

#### Scenario: Device index is negative

- **WHEN** `get_device_index` is called
- **AND** the stored device_index is negative (less than 0)
- **THEN** the function returns the current active device index
- **AND** logs a warning: "Invalid device index, falling back to device {index}"

#### Scenario: Device index out of range

- **WHEN** `get_device_index` is called
- **AND** the stored device_index is greater than or equal to `device_service.device_count`
- **THEN** the function returns the current active device index
- **AND** logs a warning: "Invalid device index, falling back to device {index}"

#### Scenario: Valid device index

- **WHEN** `get_device_index` is called
- **AND** the stored device_index is valid (non-negative and less than device_count)
- **THEN** the function returns the stored device_index
- **AND** no warning is logged
