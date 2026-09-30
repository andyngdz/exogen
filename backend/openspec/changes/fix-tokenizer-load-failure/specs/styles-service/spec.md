## ADDED Requirements

### Requirement: Tokenizer Auto-Download

The styles service SHALL automatically download and cache the CLIP tokenizer on first use.

#### Scenario: First use downloads tokenizer
- **WHEN** CLIP tokenizer is accessed for the first time
- **AND** tokenizer files are not cached locally
- **THEN** tokenizer files are downloaded from HuggingFace Hub
- **AND** files are cached in `~/.cache/huggingface/hub`

#### Scenario: Subsequent use loads from cache
- **WHEN** CLIP tokenizer is accessed after initial download
- **THEN** tokenizer loads from local cache without network access

#### Scenario: Cached instance reused
- **WHEN** CLIP tokenizer is accessed multiple times in same session
- **THEN** the same cached instance is returned
