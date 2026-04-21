# Health Check

## Purpose

Health check and initial routing flow that ensures the backend is ready and routes users to the appropriate screen based on their configuration status.

## Requirements

## ADDED Requirements

### Requirement: Backend Readiness Gate

The system SHALL wait for both backend health check AND config query to complete before making routing decisions.

#### Scenario: Health check passes but config loading

- **WHEN** backend health check succeeds
- **AND** config query is still loading
- **THEN** the system SHALL NOT navigate away from the health check screen

#### Scenario: Both checks complete

- **WHEN** backend health check succeeds
- **AND** config query completes loading
- **THEN** the system proceeds with routing decision

### Requirement: Initial Route Resolution

The system SHALL route users to the appropriate screen based on their device configuration status.

#### Scenario: Device already configured

- **WHEN** backend is healthy
- **AND** config is loaded
- **AND** `isHasDevice` is `true`
- **THEN** navigate to `/editor`

#### Scenario: Device not configured

- **WHEN** backend is healthy
- **AND** config is loaded
- **AND** `isHasDevice` is `false`
- **THEN** navigate to `/gpu-detection`

### Requirement: Health Check Hook Extraction

The system SHALL provide a `useHealthCheck()` hook that encapsulates health check logic and routing behavior.

#### Scenario: Hook provides health status

- **WHEN** component uses `useHealthCheck()` hook
- **THEN** it receives `isHealthy` boolean indicating backend health status

#### Scenario: Hook handles routing

- **WHEN** backend becomes healthy and config is loaded
- **THEN** the hook automatically triggers navigation based on device configuration

### Requirement: Setup Status Display

The system SHALL display backend setup progress (e.g., "Installing uv", "Cloning repo", "Backend is running") while waiting for backend readiness.

#### Scenario: Setup logs visible

- **WHEN** backend is initializing
- **THEN** user sees status messages in the health check screen

#### Scenario: Healthy status shown

- **WHEN** backend health check passes
- **THEN** user sees "Backend is running" status
