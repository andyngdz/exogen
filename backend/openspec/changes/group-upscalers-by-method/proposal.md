# Proposal: Group Upscalers by Method

## Summary

Restructure the upscalers response from a flat list to grouped sections by upscaling method (traditional vs AI), making it easier for the frontend to render categorized upscaler options.

## Motivation

The current API returns a flat list of upscalers, requiring the frontend to filter and group them by method. By providing pre-grouped sections with titles, the frontend can directly render categorized UI sections without additional data processing.

## Proposed Change

Transform the response structure from:

```json
{
  "upscalers": [
    { "value": "Lanczos", "method": "traditional", ... },
    { "value": "RealESRGAN_x2plus", "method": "ai", ... }
  ]
}
```

To:

```json
{
  "upscalers": [
    {
      "method": "traditional",
      "title": "Traditional",
      "options": [{ "value": "Lanczos", ... }]
    },
    {
      "method": "ai",
      "title": "AI",
      "options": [{ "value": "RealESRGAN_x2plus", ... }]
    }
  ]
}
```

## Scope

- **Modified**: `app/schemas/config.py` - Add `UpscalerSection` schema, update `ConfigResponse`
- **Modified**: `app/features/config/service.py` - Add `get_upscaler_sections()` method
- **Modified**: `app/features/config/api.py` - Use new grouped response
- **Modified**: `openspec/specs/config-api/spec.md` - Update requirements

## Breaking Change

Yes - the `upscalers` field structure changes from flat list to grouped sections. Frontend must update to consume the new nested structure.
