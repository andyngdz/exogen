import { describe, expect, it } from 'vitest'
import { GpuDetectionFormProps } from '../gpu-detection'

describe('GPU Detection Types', () => {
  it('GpuDetectionFormProps should have correct structure', () => {
    const mockFormProps: GpuDetectionFormProps = {
      gpu: 0,
      gpuScaleFactor: 0.5,
      ramScaleFactor: 0.5
    }

    expect(mockFormProps.gpu).toBe(0)
    expect(typeof mockFormProps.gpu).toBe('number')
  })

  it('GpuDetectionFormProps should accept different gpu values', () => {
    const limits = { gpuScaleFactor: 0.5, ramScaleFactor: 0.5 }
    const formProps1: GpuDetectionFormProps = { gpu: 1, ...limits }
    const formProps2: GpuDetectionFormProps = { gpu: 2, ...limits }

    expect(formProps1.gpu).toBe(1)
    expect(formProps2.gpu).toBe(2)
  })
})
