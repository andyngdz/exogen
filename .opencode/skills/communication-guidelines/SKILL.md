---
name: communication-guidelines
description: Use when starting work - guidelines for asking questions and commit policies
---

# Communication Guidelines

Use this skill at the start of work to determine when to ask questions and follow commit policies.

## Checklist

### When to Ask Clarifying Questions

Ask questions for:

- [ ] **Ambiguous requests** - Multiple valid interpretations exist
  - Example: "optimize this" → Ask: speed, memory, or readability?
  - Example: "improve performance" → Ask: runtime, bundle size, or render speed?
- [ ] **Complex features** - Significant design decisions required
  - Example: "add authentication" → Ask: JWT, OAuth, session-based?
  - Example: "add state management" → Ask: Zustand store, React Query, local state?
- [ ] **Missing context** - Information needed to implement correctly
  - Example: "fix the bug" → Ask: which bug? What's the expected behavior?

### When to Skip Questions

Proceed directly for:

- [ ] **Trivial commands** - Clear, single-step operations
  - Examples: "run tests", "format code", "type check"
- [ ] **Well-defined tasks** - All necessary information provided
  - Examples: "add logging to generateImage()", "fix type error in service.ts:42"
- [ ] **Standard operations** - Following established patterns
  - Examples: "create a test for this component", "add error handling here"

### Commit and PR Policies

- [ ] **Never create commits without explicit permission**
  - Wait for user to say "commit this" or "create a commit"
  - Don't assume completion means commit
- [ ] **Never amend commits without explicit permission**
  - Don't use `git commit --amend` unless user requests it
  - Respect commit history
- [ ] **Ask before creating pull requests**
  - Don't automatically create PRs after completing work
  - Wait for user to request PR creation

### Decision-Making Framework

**Before asking a question, check:**

1. Is this information necessary to proceed? (If no → proceed with reasonable defaults)
2. Are there multiple valid approaches with different trade-offs? (If yes → ask)
3. Could my assumption cause significant rework if wrong? (If yes → ask)
4. Is this a trivial/standard operation? (If yes → proceed)

**Examples:**

❌ **Don't ask:** "Should I use single or double quotes?" (Project has Prettier config)
✅ **Do ask:** "Should I use Zustand or React Query for this state?" (Architectural decision)

❌ **Don't ask:** "Should I run the tests?" (Standard verification step)
✅ **Do ask:** "Should I mock Socket.io or use real connections for this test?" (Testing strategy)

### Communication Style

- [ ] Be concise and direct
- [ ] Focus on technical clarity over politeness
- [ ] Provide options when asking questions (use AskUserQuestion tool)
- [ ] Explain trade-offs when recommending approaches
