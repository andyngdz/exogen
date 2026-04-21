# Change: Migrate Legacy Specs to OpenSpec Archive

## Why

The project has 9 feature specifications in `specs/` using a legacy format. OpenSpec provides a standardized spec-driven development workflow with better tooling (`openspec validate`, `openspec show`, etc.). Converting the existing specs to OpenSpec archive format unifies all historical documentation under a single system.

## What Changes

- Move 9 legacy specs from `specs/` to `openspec/changes/archive/`
- Convert file structure to OpenSpec format (spec.md → renamed, plan.md preserved as design.md)
- Remove numbered prefixes from directory names (e.g., `001-model-load-progress` → `model-load-progress`)
- Delete original `specs/` directory after migration
- Update `project.md` with ExoGen project context

## Impact

- Affected code: None (documentation-only change)
- Affected specs: All 9 legacy specs will be archived:
  - 001-model-load-progress → model-load-progress
  - 002-auto-update → auto-update
  - 003-log-streaming → log-streaming
  - 004-release → release
  - 005-default-styles → default-styles
  - 006-styles-search → styles-search
  - 007-history-photoview → history-photoview
  - 008-lora-integration → lora-integration
  - 009-backend-config → backend-config

## Migration Mapping

| Legacy Location                          | OpenSpec Location                                        |
| ---------------------------------------- | -------------------------------------------------------- |
| `specs/001-model-load-progress/spec.md`  | `openspec/changes/archive/model-load-progress/spec.md`   |
| `specs/001-model-load-progress/plan.md`  | `openspec/changes/archive/model-load-progress/design.md` |
| `specs/009-backend-config/tasks.md`      | `openspec/changes/archive/backend-config/tasks.md`       |
| `specs/009-backend-config/data-model.md` | `openspec/changes/archive/backend-config/data-model.md`  |
| etc.                                     | etc.                                                     |

## Notes

- This is a tooling/documentation change only - no code modifications
- OpenSpec's archive format preserves historical context while enabling future spec-driven development
- The `openspec/specs/` directory remains empty (ready for future deployed specs)
- **Validation**: This change has no spec deltas (it moves existing files to archive, not modify specs). Use `openspec archive migrate-specs-to-openspec --skip-specs --yes` after implementation.
