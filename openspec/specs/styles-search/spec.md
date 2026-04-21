# Styles Search

## Purpose

Search and filter functionality for the styles modal.

## Requirements

### Requirement: Name Search

The system SHALL filter styles by name (case-insensitive).

#### Scenario: Search by name

- **WHEN** user types a style name in search
- **THEN** styles are filtered to match the query

#### Scenario: Case-insensitive matching

- **WHEN** user searches with different casing
- **THEN** matching is case-insensitive

### Requirement: Category Search

The system SHALL filter styles by category/section ID.

#### Scenario: Search by category

- **WHEN** user searches for a category name
- **THEN** styles from that category appear

### Requirement: Prompt Keyword Search

The system SHALL filter styles by positive/negative prompt keywords.

#### Scenario: Search by prompt keyword

- **WHEN** user searches for a keyword in prompts
- **THEN** matching styles appear

### Requirement: Debounced Search

The system SHALL debounce search queries (300ms).

#### Scenario: Debounced filtering

- **WHEN** user types quickly
- **THEN** search only triggers after 300ms pause

### Requirement: Empty State

The system SHALL display empty state when no results match.

#### Scenario: No results message

- **WHEN** search returns no matches
- **THEN** an empty state message is displayed

### Requirement: Clearable Input

The system SHALL provide a clearable search input.

#### Scenario: Clear search

- **WHEN** user clears the search input
- **THEN** all styles are shown again instantly

### Requirement: Section Filtering

The system SHALL hide sections with no matching styles.

#### Scenario: Empty sections hidden

- **WHEN** a section has no matching styles
- **THEN** that section is hidden from view

## Key Entities

- **SearchQuery**: User-entered search string
- **FilteredSections**: StyleSection[] with only matching styles
