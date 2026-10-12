## ADDED Requirements

### Requirement: Concise README Documentation

The README.md SHALL provide essential project documentation focused on quick start:
- Project description with supported model types
- Feature list organized by category
- System requirements
- Installation instructions
- Server running instructions
- Development commands for contributors
- Configuration overview
- Contributing guidelines
- Feedback and issue reporting links

The README SHALL NOT include information that is easily discoverable elsewhere:
- Tech stack (available in pyproject.toml)
- Project structure (discoverable in codebase)
- API endpoints (available at /docs endpoint)
- WebSocket events (documented in codebase)

#### Scenario: New user gets started
- **WHEN** a new user opens the README.md
- **THEN** they can install dependencies and run the server within minutes

#### Scenario: Developer contributes
- **WHEN** a developer wants to contribute
- **THEN** they can find coding style and development commands without scrolling through verbose documentation
