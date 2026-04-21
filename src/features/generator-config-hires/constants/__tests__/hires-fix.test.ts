import { UpscaleFactor, UpscalerType } from '@/cores/constants'
import { describe, expect, it } from 'vitest'
import { UPSCALE_FACTORS, UPSCALERS } from '../hires-fix'

describe('hires-fix constants', () => {
  describe('UPSCALE_FACTORS', () => {
    it('contains all upscale factor options', () => {
      expect(UPSCALE_FACTORS).toHaveLength(4)
    })

    it('includes 1.5x factor', () => {
      const factor = UPSCALE_FACTORS.find(
        (f) => f.value === UpscaleFactor.ONE_POINT_FIVE
      )
      expect(factor).toBeDefined()
      expect(factor?.label).toBe('1.5x')
    })

    it('includes 2x factor', () => {
      const factor = UPSCALE_FACTORS.find((f) => f.value === UpscaleFactor.TWO)
      expect(factor).toBeDefined()
      expect(factor?.label).toBe('2x')
    })

    it('includes 3x factor', () => {
      const factor = UPSCALE_FACTORS.find(
        (f) => f.value === UpscaleFactor.THREE
      )
      expect(factor).toBeDefined()
      expect(factor?.label).toBe('3x')
    })

    it('includes 4x factor', () => {
      const factor = UPSCALE_FACTORS.find((f) => f.value === UpscaleFactor.FOUR)
      expect(factor).toBeDefined()
      expect(factor?.label).toBe('4x')
    })

    it('has correct structure for each factor', () => {
      UPSCALE_FACTORS.forEach((factor) => {
        expect(factor).toHaveProperty('value')
        expect(factor).toHaveProperty('label')
        expect(typeof factor.value).toBe('number')
        expect(typeof factor.label).toBe('string')
      })
    })
  })

  describe('UPSCALERS', () => {
    it('contains all upscaler options', () => {
      expect(UPSCALERS).toHaveLength(4)
    })

    it('includes Lanczos upscaler', () => {
      const upscaler = UPSCALERS.find((u) => u.value === UpscalerType.LANCZOS)
      expect(upscaler).toBeDefined()
      expect(upscaler?.label).toBe('Lanczos (Highest Quality)')
    })

    it('includes Bicubic upscaler', () => {
      const upscaler = UPSCALERS.find((u) => u.value === UpscalerType.BICUBIC)
      expect(upscaler).toBeDefined()
      expect(upscaler?.label).toBe('Bicubic (High Quality)')
    })

    it('includes Bilinear upscaler', () => {
      const upscaler = UPSCALERS.find((u) => u.value === UpscalerType.BILINEAR)
      expect(upscaler).toBeDefined()
      expect(upscaler?.label).toBe('Bilinear (Balanced)')
    })

    it('includes Nearest upscaler', () => {
      const upscaler = UPSCALERS.find((u) => u.value === UpscalerType.NEAREST)
      expect(upscaler).toBeDefined()
      expect(upscaler?.label).toBe('Nearest (Fastest)')
    })

    it('has correct structure for each upscaler', () => {
      UPSCALERS.forEach((upscaler) => {
        expect(upscaler).toHaveProperty('value')
        expect(upscaler).toHaveProperty('label')
        expect(typeof upscaler.value).toBe('string')
        expect(typeof upscaler.label).toBe('string')
      })
    })

    it('orders upscalers from highest to lowest quality', () => {
      expect(UPSCALERS[0].value).toBe(UpscalerType.LANCZOS)
      expect(UPSCALERS[1].value).toBe(UpscalerType.BICUBIC)
      expect(UPSCALERS[2].value).toBe(UpscalerType.BILINEAR)
      expect(UPSCALERS[3].value).toBe(UpscalerType.NEAREST)
    })
  })
})
