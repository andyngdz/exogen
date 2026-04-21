# Tasks: Migrate Legacy Specs to OpenSpec Archive

## 1. Preparation

- [x] 1.1 Update `openspec/project.md` with ExoGen project context (tech stack, conventions)

## 2. Create Archive Directories

- [x] 2.1 Create `openspec/changes/archive/model-load-progress/`
- [x] 2.2 Create `openspec/changes/archive/auto-update/`
- [x] 2.3 Create `openspec/changes/archive/log-streaming/`
- [x] 2.4 Create `openspec/changes/archive/release/`
- [x] 2.5 Create `openspec/changes/archive/default-styles/`
- [x] 2.6 Create `openspec/changes/archive/styles-search/`
- [x] 2.7 Create `openspec/changes/archive/history-photoview/`
- [x] 2.8 Create `openspec/changes/archive/lora-integration/`
- [x] 2.9 Create `openspec/changes/archive/backend-config/`

## 3. Migrate Spec Files

For each spec, copy files with appropriate renaming:

- `spec.md` → `spec.md` (keep as-is)
- `plan.md` → `design.md` (rename to OpenSpec convention)
- Other files (tasks.md, data-model.md, etc.) → preserve as-is

- [x] 3.1 Migrate model-load-progress (spec.md, plan.md → design.md)
- [x] 3.2 Migrate auto-update (spec.md, plan.md → design.md)
- [x] 3.3 Migrate log-streaming (spec.md, plan.md → design.md)
- [x] 3.4 Migrate release (spec.md, plan.md → design.md)
- [x] 3.5 Migrate default-styles (spec.md, plan.md → design.md)
- [x] 3.6 Migrate styles-search (spec.md, plan.md → design.md)
- [x] 3.7 Migrate history-photoview (spec.md, plan.md → design.md)
- [x] 3.8 Migrate lora-integration (spec.md, plan.md → design.md)
- [x] 3.9 Migrate backend-config (all files including checklists/, contracts/, tasks.md, etc.)

## 4. Cleanup

- [x] 4.1 Verify all files migrated correctly (diff check)
- [x] 4.2 Delete `specs/` directory
- [x] 4.3 Update any references to `specs/` in CLAUDE.md or other docs

## 5. Validation

- [x] 5.1 Run `openspec list` to verify changes
- [x] 5.2 Run `openspec list --specs` to verify archive structure
- [x] 5.3 Verify no broken references in documentation

## Notes

- This is parallelizable: steps 2.x and 3.x can be executed together
- Step 4.2 (delete specs/) should only happen after 4.1 verification passes
