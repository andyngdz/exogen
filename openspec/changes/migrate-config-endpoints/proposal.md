# Proposal: Migrate Config Endpoints

## Summary

Migrate frontend API calls from deprecated `/hardware/*` endpoints to the new consolidated `/config/*` endpoints. The backend has moved device and memory configuration into `/config`, making `/hardware` read-only for GPU detection.

## Breaking Changes from Backend

| Removed Endpoint          | Replacement                                    |
| ------------------------- | ---------------------------------------------- |
| GET /hardware/device      | Read `device_index` from GET /config/ response |
| POST /hardware/device     | PUT /config/device                             |
| POST /hardware/max-memory | PUT /config/max-memory                         |

## New API Response

GET /config/ now returns:

```json
{
  "upscalers": [...],
  "safety_check_enabled": true,
  "gpu_scale_factor": 0.5,
  "ram_scale_factor": 0.5,
  "total_gpu_memory": 8589934592,
  "total_ram_memory": 17179869184,
  "device_index": 0
}
```

All PUT endpoints return the full `ConfigResponse`, enabling optimistic UI updates.

## Affected Components

1. **HealthCheck** - Uses `api.getDeviceIndex()` to check if device is configured
2. **GpuDetection** - Uses `api.selectDevice()` to set device
3. **MaxMemoryScaleFactor** - Uses `api.setMaxMemory()` to set memory limits

## Implementation Approach

1. Add `device_index` field to `BackendConfig` interface
2. Remove deprecated types: `DeviceIndexResponse`, `SelectDeviceRequest`
3. Update API methods:
   - Remove `api.getDeviceIndex()` - use `useConfig().device_index` instead
   - Update `api.selectDevice()` → PUT /config/device, return `BackendConfig`
   - Update `api.setMaxMemory()` → PUT /config/max-memory, return `BackendConfig`
4. Update consuming components to use new API
5. Invalidate config query after mutations for cache consistency

## Impact

- **Low risk**: Straightforward endpoint URL changes
- **Better UX**: PUT endpoints return full config, reducing extra fetches
- **Cleaner API**: Consolidated configuration in one place
