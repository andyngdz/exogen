## MODIFIED Requirements

### Requirement: UI Component Compatibility

The system SHALL ensure component tests render HTML structures that match browser constraints.

#### Scenario: HeroUI Select usage

- **WHEN** a HeroUI v3 `Select` renders within tests
- **THEN** its options render as `ListBox.Item` elements inside `Select.Popover`
- **AND** each item has an explicit `id`, plus a `textValue` when its children are not plain text
