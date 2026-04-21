# Feature Specification: History Photoview

**Feature Branch**: `007-history-photoview` (historical - already merged)
**Created**: 2024-11
**Status**: Completed

## User Scenarios & Testing

### User Story 1 - View History in Fullscreen (Priority: P1)

As a user, I want to view my generation history in a fullscreen carousel so I can review my past generations in detail.

**Why this priority**: Core feature for reviewing and comparing past generations.

**Acceptance Scenarios**:

1. **Given** I click a history item, **When** modal opens, **Then** I see that history item in fullscreen
2. **Given** photoview is open, **When** I use arrow navigation, **Then** I move to next/previous history item
3. **Given** I'm at the last item, **When** I navigate right, **Then** it loops to the first item

### User Story 2 - View Generation Details (Priority: P2)

As a user, I want to see all generation details (images, config, timestamp) in the photoview.

**Why this priority**: Enables learning from past generations.

**Acceptance Scenarios**:

1. **Given** photoview is open, **When** I view a history card, **Then** I see all generated images in a grid
2. **Given** photoview is open, **When** I view a history card, **Then** I see all config settings as key-value pairs
3. **Given** history has styles, **When** I view config, **Then** styles display as chips

### Edge Cases

- Keyboard navigation (arrow keys, Escape to close)
- Touch/swipe navigation on mobile
- Large image grids with responsive layout
- Long config lists with scroll shadow

## Requirements

### Functional Requirements

- **FR-001**: Entire history item container MUST be clickable to open photoview
- **FR-002**: Modal MUST open at the clicked history item
- **FR-003**: Left/right navigation MUST move between history items (not individual images)
- **FR-004**: Navigation MUST loop continuously (last → first, first → last)
- **FR-005**: Each card MUST display: header (timestamp + model), images grid, config key-values
- **FR-006**: Escape key MUST close modal

### Key Entities

- **HistoryPhotoviewStore**: isOpen, currentHistoryId, openPhotoview(), closePhotoview()
- **HistoryPhotoviewCard**: Header, images grid, config display

## Success Criteria

### Measurable Outcomes

- **SC-001**: Modal opens within 100ms of clicking history item
- **SC-002**: Navigation between items is smooth and instantaneous
- **SC-003**: All config fields display correctly with appropriate formatting
- **SC-004**: Responsive layout works on mobile, tablet, and desktop
