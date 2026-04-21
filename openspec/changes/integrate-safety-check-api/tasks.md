## 1. Rename Frontend Field (sync with backend naming)

- [x] 1.1 Rename `safetyCheck` to `safety_check_enabled` in `src/features/settings/types/settings.ts`
- [x] 1.2 Update default value in `src/features/settings/states/useSettingsStore.ts`
- [x] 1.3 Update `register('safety_check_enabled')` in `src/features/settings/presentations/tabs/GeneralSettings.tsx`

## 2. Type and API Updates

- [x] 2.1 Add `safety_check_enabled: boolean` to `BackendConfig` interface in `src/types/api.ts`
- [x] 2.2 Add `setSafetyCheckEnabled(enabled: boolean)` method to API class in `src/services/api.ts`

## 3. Query and Mutation Hooks

- [x] 3.1 Add `useSafetyCheckMutation` hook in `src/cores/api-queries/queries.ts`
- [x] 3.2 Invalidate `config` query on mutation success to refetch latest state
- [x] 3.3 Export new hook from `src/cores/api-queries/queries.ts`

## 4. Config Hook Update

- [x] 4.1 Update `useConfig()` in `src/cores/hooks/useConfig.ts` to expose `safety_check_enabled` with default `true`

## 5. Settings Integration

- [x] 5.1 Update `useGeneralSettings` to call `useSafetyCheckMutation` when `safety_check_enabled` value changes
- [x] 5.2 Ensure mutation is called only on user-initiated changes (not initial sync)

## 6. Tests

- [x] 6.1 Update `src/features/settings/states/__tests__/useSettingsStore.test.ts` with renamed field
- [x] 6.2 Update `src/features/settings/states/__tests__/useGeneralSettings.test.ts` with renamed field and mutation tests
- [x] 6.3 Update `src/features/settings/presentations/tabs/__tests__/GeneralSettings.test.tsx` with renamed field
- [x] 6.4 Update `src/cores/hooks/__tests__/useConfig.test.ts` to include `safety_check_enabled`
