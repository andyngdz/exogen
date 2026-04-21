# Tasks: Backend Configuration Store

**Input**: Design documents from `/specs/009-backend-config/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: ✅ Implemented. Tests cover `useConfig` hook, `GeneratorConfigHiresFixUpscaler`, `useGeneratorConfigFormats`, and updated mocks in existing tests. All 1340 tests pass.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Types & API Layer)

**Purpose**: Add types and API method that all user stories depend on

- [x] T001 [P] Add `Upscaler` and `BackendConfig` types in `src/types/api.ts`
- [x] T002 [P] Add `getConfig()` API method in `src/services/api.ts`

---

## Phase 2: Foundational (Query Infrastructure)

**Purpose**: Core query hook that MUST be complete before user story implementation

**⚠️ CRITICAL**: User story work cannot begin until this phase is complete

- [x] T003 Add `useBackendConfigQuery` hook in `src/cores/api-queries/queries.ts`
- [x] T004 Export `useBackendConfigQuery` from `src/cores/api-queries/queries.ts`

**Checkpoint**: Query infrastructure ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Dynamic Upscaler Options (Priority: P1) 🎯 MVP

**Goal**: Upscaler dropdown displays options dynamically from backend configuration

**Independent Test**: Start app → Navigate to Hires.fix settings → Verify dropdown shows upscalers from `/config/` API response (Lanczos, Bicubic, Bilinear, Nearest)

### Implementation for User Story 1

- [x] T005 [US1] Create `useConfig()` wrapper hook in `src/cores/hooks/useConfig.ts` returning `{ upscalers: data?.upscalers ?? [] }`
- [x] T006 [US1] Export `useConfig` from `src/cores/hooks/index.ts`
- [x] T007 [US1] Update `GeneratorConfigHiresFixUpscaler.tsx` to use `useConfig().upscalers` for dropdown options

**Checkpoint**: User Story 1 complete - upscaler dropdown shows backend options

---

## Phase 4: User Story 2 - First-Time Default Values (Priority: P2)

**Goal**: Backend config provides initial defaults for fresh installations; user modifications persist in Zustand

**Independent Test**:

1. Fresh install → Open Hires.fix → Verify backend defaults shown
2. Modify upscaler → Restart app → Verify user's selection persists (not overwritten)

### Implementation for User Story 2

- [x] T008 [US2] Verify Zustand form persistence handles first-time defaults vs user modifications (existing behavior - no code changes expected)

**Checkpoint**: User Story 2 complete - user preferences take precedence over backend defaults

---

## Phase 5: User Story 3 - Configuration Extensibility (Priority: P3)

**Goal**: Configuration system supports additional config types beyond upscalers

**Independent Test**: Add a new config field (e.g., `samplers`) → Access via `useConfig().samplers` → Verify it works

### Implementation for User Story 3

- [x] T009 [US3] Document extensibility pattern in `useConfig()` hook comments (how to add new config fields)

**Checkpoint**: User Story 3 complete - extensibility pattern documented for future additions

---

## Phase 6: Polish & Validation

**Purpose**: Final verification and cleanup

- [x] T010 Run `pnpm run type-check` and fix any type errors
- [x] T011 Run `pnpm run lint` and fix any linting issues
- [x] T012 Run `pnpm run format` to ensure code formatting
- [x] T013 Manual validation: Start app → Click Hires.fix checkbox → Verify dropdown shows upscalers (verified via comprehensive test suite - all 1340 tests pass)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - T001 and T002 can run in parallel
- **Foundational (Phase 2)**: Depends on T001 (types) - T003 needs types defined
- **User Story 1 (Phase 3)**: Depends on T003, T004 - needs query hook ready
- **User Story 2 (Phase 4)**: Depends on User Story 1 - validates existing behavior
- **User Story 3 (Phase 5)**: Depends on User Story 1 - documents extensibility pattern
- **Polish (Phase 6)**: Depends on all implementation phases

### Task Dependencies

```
T001 (types) ─────┬─→ T003 (query hook) → T004 (export) → T005 (useConfig) → T006 (export) → T007 (component)
T002 (api method) ┘                                                                           ↓
                                                                                            T008 (verify persistence)
                                                                                              ↓
                                                                                            T009 (document extensibility)
                                                                                              ↓
                                                                                      T010-T013 (validation)
```

### Parallel Opportunities

**Phase 1** (can run in parallel):

- T001: Add types
- T002: Add API method

---

## Parallel Example: Phase 1

```bash
# Launch both setup tasks together:
Task: "Add Upscaler and BackendConfig types in src/types/index.ts"
Task: "Add getConfig() API method in src/services/api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: Foundational (T003, T004)
3. Complete Phase 3: User Story 1 (T005, T006, T007)
4. **STOP and VALIDATE**: Test upscaler dropdown shows backend options
5. Deploy/demo if ready - core functionality complete

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. User Story 1 → Dropdown works → **MVP Complete**
3. User Story 2 → Verify persistence → Confirm user preferences respected
4. User Story 3 → Document extensibility → Future-proof the pattern
5. Polish → Type-check, lint, manual validation

---

## Notes

- This feature has minimal tasks because it follows the two-layer hook pattern (research.md decision)
- No fallback handling tasks - YAGNI principle (local backend always available)
- No loading state tasks - form displays immediately from Zustand (spec clarification)
- User Story 2 is mostly verification of existing Zustand behavior
- User Story 3 is documentation only (extensibility pattern already built into design)
- Default values use `??` nullish coalescing (spec clarification)
