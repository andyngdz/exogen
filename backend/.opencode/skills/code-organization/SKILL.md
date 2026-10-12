---
name: code-organization
description: Master code organization - encapsulation with wrapper methods, file modularity (split >150 lines), one function one responsibility, descriptive naming, minimal comments
---

# Code Organization

## Encapsulation

**Use wrapper methods instead of exposing internal dependencies.** This provides better encapsulation and makes refactoring easier.

**Bad example:**

```python
class DownloadService:
    def __init__(self):
        self.repository = HuggingFaceRepository()

    def download_model(self, id: str):
        # Directly accessing internal API of repository
        repo_info = self.repository.api.repo_info(id)
        ...
```

**Good example:**

```python
class HuggingFaceRepository:
    def get_repo_info(self, id: str) -> RepoInfo:
        """Get repository information from HuggingFace Hub."""
        return self.api.repo_info(id)

class DownloadService:
    def __init__(self):
        self.repository = HuggingFaceRepository()

    def download_model(self, id: str):
        # Using wrapper method - better encapsulation
        repo_info = self.repository.get_repo_info(id)
        ...
```

**Benefits:**

- Hides implementation details
- Makes it easier to add logging, caching, or error handling
- Simplifies testing (mock the wrapper instead of internal dependencies)
- Allows changing the underlying implementation without affecting callers

## File Modularity

**Never put everything in one file.** Split large files into focused modules with single responsibilities.

**When to split:**

- File exceeds 150 lines
- Class has more than 5 distinct responsibilities
- Logic can be grouped into clear, reusable modules

**How to split:**

- Group related functions into separate files
- Create modules by responsibility (e.g., `repository.py`, `filters.py`, `file_downloader.py`)
- Keep main service file as a thin orchestration layer
- Use clear, descriptive filenames that indicate purpose

**Example structure:**

```
features/downloads/
  ├── services.py          # Main orchestration only
  ├── repository.py        # Repository operations
  ├── file_downloader.py   # Low-level file operations
  └── filters.py           # Filtering logic
```

## Function Design

**One function, one responsibility.** Each function should do exactly one thing and do it well.

**Bad example:**

```python
def process_user(user_data):
    # Validates, saves, and sends email - too many responsibilities
    if not user_data.get('email'):
        raise ValueError('Email required')
    db.save(user_data)
    send_welcome_email(user_data['email'])
    return user_data
```

**Good example:**

```python
def validate_user_data(user_data):
    if not user_data.get('email'):
        raise ValueError('Email required')

def save_user(user_data):
    return db.save(user_data)

def send_welcome_email(email):
    # Only handles email sending
    ...
```

## Code Clarity

**Use descriptive variable names in loops.** Never use single letters that don't convey meaning.

**Bad examples:**

```python
for p in components_scopes:  # What is 'p'?
for i in users:              # 'i' suggests index, but it's a user
for x in files:              # Meaningless
```

**Good examples:**

```python
for component_scope in components_scopes:
for scope in components_scopes:  # If 'scope' is clear in context
for user in users:
for file_path in files:
```

**Minimize comments—write self-documenting code instead.**

- Only add comments for non-obvious business logic or workarounds
- Never comment on what the code does (code should be clear enough)
- Only comment on why it does it (when it's not obvious)
- Add comments for hacky solutions that can't be avoided

**Bad examples:**

```python
# Increment counter
counter += 1

# Loop through users
for user in users:
    # Process user
    process_user(user)
```

**Good examples:**

```python
# Workaround for HuggingFace API returning inconsistent revision formats
# See: https://github.com/huggingface/huggingface_hub/issues/1234
revision = getattr(repo_info, 'sha', None) or 'main'

# Skip lock acquisition here because this method is always called
# within a context that already holds the lock
self._update_state_unsafe(new_state)
```

## Using Unique Identifiers

**Use database IDs or unique identifiers for adapter/instance names.** When working with multiple instances of objects (adapters, plugins, etc.), use database IDs or UUIDs for guaranteed uniqueness.

**Bad example:**

```python
for idx, config in enumerate(lora_configs):
    adapter_name = f"lora_{idx}"  # Index can change if list order changes
    self.pipe.load_lora_weights(config.file_path, adapter_name=adapter_name)
```

**Good example:**

```python
for config in lora_configs:
    adapter_name = f"lora_{config.id}"  # Database ID is stable and unique
    self.pipe.load_lora_weights(config.file_path, adapter_name=adapter_name)
```

**Benefits:**
- Guaranteed uniqueness
- Stable across reorderings
- Easier to debug (can trace back to database)
- More predictable behavior
