# Change: Model Loader Modularization

## Why
Model loader code was monolithic and hard to maintain.

## What Changes
- Split model loader into focused modules
- Improved separation of concerns
- Better testability of individual components

## Impact
- Affected code: `app/cores/model_loader/`
