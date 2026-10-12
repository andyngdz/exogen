# Add Safety Check Toggle

## Problem

The safety checker always runs during image generation (for SD 1.5 models). Users cannot disable it from the frontend, even though a checkbox exists in the UI.

## Solution

Add a global `safety_check_enabled` setting stored in the database:

1. Add `safety_check_enabled` column to `Config` table (default: `true`)
2. Add CRUD functions to get/set the value
3. Expose via `GET /config` for frontend sync
4. Add `PUT /config/safety-check` endpoint to toggle
5. Skip safety checker in `latent_decoder.run_safety_checker()` when disabled

## Scope

- Database: Add column + migration
- Config API: Return `safety_check_enabled` in response, add toggle endpoint
- Generation: Check setting before running safety checker

## Out of Scope

- SDXL safety checker support (future enhancement)
- Per-request toggle (using global setting instead)
