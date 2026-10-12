import { describe, expect, it } from 'vitest'
import * as GpuDetectionExports from '../index'

describe('GPU Detection Exports', () => {
  it('exports GpuDetection component', () => {
    expect(GpuDetectionExports.GpuDetection).toBeDefined()
  })
})
