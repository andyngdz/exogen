# Change: Fix tokenizer load failure crashing image generation

## Why

When the CLIP tokenizer files are missing locally, `CLIPTokenizer.from_pretrained(..., local_files_only=True)` raises a `TypeError` (vocab_file is `None`). This crashes the entire image generation flow because users who haven't pre-downloaded CLIP tokenizer files cannot generate images at all.

The `local_files_only=True` flag prevents the tokenizer from auto-downloading and caching like other HuggingFace resources (e.g., GPT-2 tokenizer already works this way).

## What Changes

- Remove `local_files_only=True` from CLIP tokenizer loading
- Allow CLIP tokenizer to auto-download on first use (~350KB, cached in `~/.cache/huggingface/hub`)
- Consistent behavior with GPT-2 tokenizer which already auto-downloads

## Impact

- Affected specs: `styles-service` (new capability spec)
- Affected code: `app/services/styles.py`
- No breaking changes: existing behavior preserved for users with cached files
- Trade-off: First use requires brief network access for download
