---
name: plan-management
description: Use when exiting plan mode - where to save implementation plans
---

# Plan Management

Use this skill when exiting plan mode to save implementation plans correctly.

## Checklist

### Saving Implementation Plans
When exiting plan mode:
- [ ] Save plan in `plans/` directory at project root
- [ ] Use naming format: `{serial-number}-{plan-name}.md`
  - Serial number: incrementing number (001, 002, 003, etc.)
  - Plan name: lowercase-with-hyphens describing the feature/task
- [ ] Include plan details: overview, steps, file changes, validation

### Plan File Structure

```markdown
# [Feature Name] Implementation Plan

**Serial:** [number]
**Created:** [date]

## Overview
[Brief description of what will be implemented]

## Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Files to Modify/Create
- `path/to/file1.py` - [what changes]
- `path/to/file2.py` - [what changes]

## Validation
- [ ] Tests pass
- [ ] Type checks pass
- [ ] Lint checks pass
```

### Examples

**Good filenames:**
- `plans/001-user-authentication.md`
- `plans/002-image-generation-api.md`
- `plans/003-model-caching.md`

**Bad filenames:**
- `plans/plan.md` (no serial number, not descriptive)
- `plans/User Authentication Plan.md` (spaces, capitals)
- `implementation-plan.md` (wrong directory)

### Before Exiting Plan Mode
- [ ] Verify plan is comprehensive (all steps included)
- [ ] Verify plan includes file paths to modify
- [ ] Verify plan includes validation steps
- [ ] Save plan to `plans/{serial}-{name}.md`
- [ ] Confirm plan file exists before exiting

### After Saving Plan
The plan can be used for:
- Reference during implementation
- Code review validation
- Future similar features
- Onboarding documentation
