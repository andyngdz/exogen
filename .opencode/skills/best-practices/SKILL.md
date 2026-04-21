---
name: best-practices
description: Use when refactoring or implementing features - validation, component design, API research
---

# Best Practices

Use this skill when implementing features or refactoring code to follow established patterns.

## Checklist

### Validation Before Claiming Success

- [ ] **Unit tests passing ≠ code is correct**
  - Check application logs for warnings and timing issues
  - Test with real workloads when possible
  - Verify behavior matches requirements, not just tests
- [ ] **Performance matters**
  - Check for unnecessary re-renders (React DevTools)
  - Verify bundle size impact for new dependencies
  - Test with realistic data volumes

### Question Patterns Before Copying

When copying code from elsewhere in the codebase:

- [ ] **What problem does this solve?**
  - Understand the original use case
  - Verify it applies to your situation
- [ ] **Does this pattern apply here?**
  - Consider the context differences
  - Don't blindly copy without understanding
- [ ] **What's the performance impact?**
  - Understand computational cost
  - Consider alternative approaches

### Refactoring Guidelines

- [ ] **Update tests when behavior/API contracts change**
  - Don't keep tests passing by mocking new behavior
  - Update assertions to match new contracts
- [ ] **Prefer editing existing files over creating new ones**
  - Don't create new files for minor changes
  - Keep related code together
- [ ] **Component Encapsulation**
  - Use hooks internally instead of passing derived values as props
  - Avoid unnecessary prop drilling

**Examples:**

```typescript
// ✅ Good - component encapsulates its own dependencies
export const ImageGrid: FC<{ images: Image[] }> = ({ images }) => {
  const baseURL = useBackendUrl()
  return <div>{/* render images with baseURL */}</div>
}

// ❌ Avoid - unnecessary prop drilling
export const ImageGrid: FC<{ images: Image[]; baseURL: string }> = ({
  images,
  baseURL
}) => {
  return <div>{/* render images */}</div>
}
```

### Extract Duplicated Configuration

- [ ] **Identical configs in multiple files → Extract to constants**
  - Look for repeated option objects
  - Look for repeated configuration values
  - Create shared constants file
  - Import from single source of truth

**Example:**

```typescript
// ❌ Bad - duplicated configuration
// file1.ts
const options = { timeout: 5000, retries: 3 }

// file2.ts
const options = { timeout: 5000, retries: 3 }

// ✅ Good - extracted to shared constant
// constants.ts
export const API_OPTIONS = { timeout: 5000, retries: 3 }

// file1.ts & file2.ts
import { API_OPTIONS } from './constants'
```

### Verify API Behavior Before Refactoring

- [ ] **Read official documentation for the API**
  - Don't assume behavior based on naming
  - Check for version-specific differences
  - Understand return types and possible values
- [ ] **Don't add defensive code based on assumptions**
  - Only add guards/checks if behavior actually differs
  - Test edge cases to verify actual behavior
- [ ] **Test cases should match real API behavior**
  - Don't test for imagined edge cases
  - Mock realistic responses, not theoretical ones

**Example:**

```typescript
// ❌ Bad - defensive code based on assumptions
const value = api.getValue()
if (value === null || value === undefined || value === '') {
  // Assuming getValue() can return null/undefined/empty
}

// ✅ Good - verified that getValue() only returns string or throws
try {
  const value = api.getValue() // Documentation: returns string or throws
  // Use value directly
} catch (error) {
  // Handle error case
}
```

### Research First

- [ ] **Check official documentation** before implementing
  - Libraries: Read the official docs, not blog posts
  - APIs: Check the specification/documentation
  - Frameworks: Follow official guides and examples
- [ ] **Check existing patterns** in the codebase
  - Search for similar implementations
  - Follow established conventions
  - Ask if unsure about approach

## Common Pitfalls

**Over-validation:**

- Don't add checks for impossible states
- Trust internal APIs and framework guarantees
- Only validate at system boundaries (user input, external APIs)

**Premature abstraction:**

- Don't create helpers for one-time operations
- Don't design for hypothetical future requirements
- Three similar lines is better than premature abstraction

**Ignoring performance:**

- Tests passing ≠ code is performant
- Check re-render count, bundle size, load times
- Profile before and after changes

## Reference

See `@docs/CODING_STYLE.md` for detailed coding standards.
