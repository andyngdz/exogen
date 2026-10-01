import { describe, expect, it } from 'vitest'
import * as HealthCheckExports from '../index'

describe('Health Check Exports', () => {
  it('exports HealthCheck component', () => {
    expect(HealthCheckExports.HealthCheck).toBeDefined()
  })
})
