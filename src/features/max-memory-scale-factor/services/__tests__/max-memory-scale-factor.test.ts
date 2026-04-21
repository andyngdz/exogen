import { describe, expect, it } from 'vitest'
import { maxMemoryScaleFactorService } from '../max-memory-scale-factor'

describe('MaxMemoryScaleFactorService', () => {
  describe('memoryColor', () => {
    it('returns success color for scale factor <= 0.5', () => {
      const result = maxMemoryScaleFactorService.color(0.5)
      expect(result).toBe('success')
    })

    it('returns success color for scale factor < 0.5', () => {
      const result = maxMemoryScaleFactorService.color(0.3)
      expect(result).toBe('success')
    })

    it('returns warning color for scale factor > 0.5 and <= 0.7', () => {
      const result = maxMemoryScaleFactorService.color(0.6)
      expect(result).toBe('warning')
    })

    it('returns warning color for scale factor = 0.7', () => {
      const result = maxMemoryScaleFactorService.color(0.7)
      expect(result).toBe('warning')
    })

    it('returns danger color for scale factor > 0.7', () => {
      const result = maxMemoryScaleFactorService.color(0.8)
      expect(result).toBe('danger')
    })

    it('returns danger color for scale factor = 1', () => {
      const result = maxMemoryScaleFactorService.color(1)
      expect(result).toBe('danger')
    })

    it('handles edge cases like 0 and negative values', () => {
      const zeroResult = maxMemoryScaleFactorService.color(0)
      expect(zeroResult).toBe('success')

      const negativeResult = maxMemoryScaleFactorService.color(-0.1)
      expect(negativeResult).toBe('success')
    })
  })
})
