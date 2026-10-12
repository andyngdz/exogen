# Change: Handle Missing Model Index

## Why
Application crashed when model_index.json was missing from model directories.

## What Changes
- Added graceful handling for missing model_index.json
- Improved error messages for invalid model directories

## Impact
- Affected code: `app/cores/model_loader/`
