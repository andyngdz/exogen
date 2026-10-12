---
name: refactoring-patterns
description: Apply Martin Fowler's refactoring patterns - extract variables to eliminate repetition, split temporary variables, replace temp with query for cleaner, more maintainable code
---

# Refactoring Patterns

> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler

## Extract Variable Pattern

**Extract variables to eliminate repetition and improve code clarity.** This fundamental refactoring pattern applies when expressions are repeated or when a descriptive name would clarify intent.

### When to Extract Variables:

1. **Repeated expressions** - Compute once, reuse multiple times
2. **Complex calculations** - Break down into named intermediate steps
3. **Unclear intent** - Use descriptive names to explain what a value represents
4. **Multiple field accesses** - Cache field lookups to improve performance

### Use Case 1: Extract Computed Values

Eliminate repetition of calculations and normalization logic.

**Bad example:**

```python
def set_size(self, filename: str, size: int) -> None:
    if filename in self._files_dict:
        self._files_dict[filename].size = max(size, 0)  # Repeated
    else:
        self._files_dict[filename] = RepositoryFileSize(
            filename=filename,
            size=max(size, 0)  # Repeated
        )
```

**Good example:**

```python
def set_size(self, filename: str, size: int) -> None:
    normalized_size = max(size, 0)  # Extract once, reuse

    if filename in self._files_dict:
        self._files_dict[filename].size = normalized_size
    else:
        self._files_dict[filename] = RepositoryFileSize(
            filename=filename,
            size=normalized_size
        )
```

### Use Case 2: Extract Complex Expressions

Use explaining variables to break down complex logic into understandable steps.

**Bad example:**

```python
if (user.is_active and user.subscription_end > datetime.now() and
    user.payment_status == 'paid' and user.role in ['premium', 'enterprise']):
    grant_access()
```

**Good example:**

```python
has_valid_subscription = user.subscription_end > datetime.now()
has_paid_status = user.payment_status == 'paid'
has_premium_role = user.role in ['premium', 'enterprise']
is_eligible = user.is_active and has_valid_subscription and has_paid_status and has_premium_role

if is_eligible:
    grant_access()
```

### Use Case 3: Extract Object Field Access

Cache repeated field lookups for clarity and performance.

**Bad example:**

```python
for config in lora_configs:
    logger.info(f"Loading LoRA '{config.name}' (weight: {config.weight})")
    try:
        self.pipe.load_lora_weights(config.file_path, adapter_name=adapter_name)
    except Exception as error:
        logger.error(f"Failed to load LoRA '{config.name}': {error}")
        raise ValueError(f"Failed to load LoRA '{config.name}': {error}")
```

**Good example:**

```python
for config in lora_configs:
    name = config.name  # Extract once, reuse

    logger.info(f"Loading LoRA '{name}' (weight: {config.weight})")
    try:
        self.pipe.load_lora_weights(config.file_path, adapter_name=adapter_name)
    except Exception as error:
        logger.error(f"Failed to load LoRA '{name}': {error}")
        raise ValueError(f"Failed to load LoRA '{name}': {error}")
```

### Use Case 4: Extract Function Call Results

Avoid redundant expensive operations (API calls, database queries, I/O).

**Bad example:**

```python
def download_model(self, model_id: str) -> None:
    logger.info(f"Downloading {self.repository.get_repo_info(model_id).modelId}")
    files = self.repository.list_files(model_id)

    if self.repository.get_repo_info(model_id).private:  # Redundant API call
        self._validate_token()
```

**Good example:**

```python
def download_model(self, model_id: str) -> None:
    repo_info = self.repository.get_repo_info(model_id)  # Call once

    logger.info(f"Downloading {repo_info.modelId}")
    files = self.repository.list_files(model_id)

    if repo_info.private:
        self._validate_token()
```

### When NOT to Extract:

1. **Single use** - Don't extract if used only once
2. **Obvious expressions** - `x + 1` doesn't need extraction
3. **Very short scope** - Within 2-3 adjacent lines where context is clear

**Over-extraction example (avoid):**

```python
# Too granular - reduces readability
one = 1
result = x + one  # Just use x + 1
```

## Split Temporary Variable

Use different variables for different purposes instead of reusing one variable.

**Bad example:**

```python
temp = base_price * quantity
logger.info(f"Subtotal: {temp}")

temp = temp * (1 + tax_rate)  # Reusing 'temp' for different purpose
logger.info(f"Total: {temp}")
```

**Good example:**

```python
subtotal = base_price * quantity
logger.info(f"Subtotal: {subtotal}")

total = subtotal * (1 + tax_rate)  # Clear purpose
logger.info(f"Total: {total}")
```

## Replace Temp with Query

When a temporary variable can be replaced with a computed property (useful for testability).

**Before:**

```python
base_price = quantity * item_price
if base_price > 1000:
    return base_price * 0.95
return base_price * 0.98
```

**After (using @property):**

```python
@property
def base_price(self) -> float:
    return self.quantity * self.item_price

@property
def final_price(self) -> float:
    if self.base_price > 1000:
        return self.base_price * 0.95
    return self.base_price * 0.98
```

**Benefits of @property:**
- Pythonic - access like attributes, not method calls
- Clear intent - these are computed values, not actions
- Cleaner syntax - no `()` needed

## Summary

Extract variables when it makes code:
- **DRY** (Don't Repeat Yourself) - Compute once, use many times
- **Clear** - Descriptive names explain what values represent
- **Maintainable** - Changes happen in one place
- **Performant** - Avoid redundant expensive operations

**References:**
- Martin Fowler, "Refactoring: Improving the Design of Existing Code"
- Extract Variable (Introduce Explaining Variable)
- Split Temporary Variable
- Replace Temp with Query
