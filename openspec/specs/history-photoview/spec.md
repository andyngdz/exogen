# History Photoview

## Purpose

Fullscreen carousel view for browsing generation history.

## Requirements

### Requirement: Fullscreen Modal

The system SHALL open a fullscreen modal when clicking a history item.

#### Scenario: Open photoview on click

- **WHEN** user clicks a history item
- **THEN** a fullscreen modal opens showing that history item

#### Scenario: Close with Escape

- **WHEN** user presses Escape key
- **THEN** the modal closes

### Requirement: History Navigation

The system SHALL support navigation between history items using left/right controls.

#### Scenario: Navigate to next item

- **WHEN** user clicks right arrow or presses right key
- **THEN** the next history item is displayed

#### Scenario: Navigate to previous item

- **WHEN** user clicks left arrow or presses left key
- **THEN** the previous history item is displayed

### Requirement: Continuous Loop

The system SHALL loop navigation continuously (last → first, first → last).

#### Scenario: Loop from last to first

- **WHEN** user is at last item and navigates right
- **THEN** the first item is displayed

#### Scenario: Loop from first to last

- **WHEN** user is at first item and navigates left
- **THEN** the last item is displayed

### Requirement: History Card Display

The system SHALL display each history card with header (timestamp + model), images grid, and config key-values.

#### Scenario: Card with images grid

- **WHEN** photoview shows a history item
- **THEN** all generated images are displayed in a grid

#### Scenario: Card with config display

- **WHEN** photoview shows a history item
- **THEN** all config settings are shown as key-value pairs

#### Scenario: Styles as chips

- **WHEN** history has styles in config
- **THEN** styles are displayed as chips

## Key Entities

- **HistoryPhotoviewStore**: isOpen, currentHistoryId, openPhotoview(), closePhotoview()
- **HistoryPhotoviewCard**: Header, images grid, config display
