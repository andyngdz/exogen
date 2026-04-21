# Update Backend Starting Message

## Summary

Two improvements to backend status messages:

1. Change the message from "ExoGen Backend started successfully" to "ExoGen Backend is starting" to more accurately reflect the state
2. Add a loading spinner icon to non-error status messages in the UI

## Motivation

### Message Text Change

The current message "ExoGen Backend started successfully" is emitted immediately after the uvicorn command is executed, but before the backend has actually started responding to requests. This is misleading because the term "is starting" better represents the ongoing initialization state.

### Loading Spinner

Adding a visual loading indicator helps users understand that the backend setup is an ongoing process, not just a static list of completed steps.

## Scope

### Backend Message Change

- `scripts/backend/run-backend.ts` - Update message string
- `scripts/backend/__tests__/run-backend.test.ts` - Update test expectations

### UI Spinner Addition

- `src/features/health-check/presentations/BackendStatusItem.tsx` - Add spinner to non-error messages
- `src/features/health-check/presentations/__tests__/BackendStatusItem.test.tsx` - Update tests

## Risks

- **Low risk**: Simple changes with no behavioral impact on backend startup logic
- Tests will need updating to match new message and verify spinner presence
