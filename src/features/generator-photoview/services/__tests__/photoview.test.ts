import { photoviewService } from '@/features/generator-photoview/services/photoview'
import { describe, expect, it } from 'vitest'

describe('photoviewService.toSeedLabel', () => {
  it('labels -1 as Random and shows other seeds as numbers', () => {
    expect(photoviewService.toSeedLabel(-1)).toBe('Random')
    expect(photoviewService.toSeedLabel(2847193650)).toBe('2847193650')
    expect(photoviewService.toSeedLabel(0)).toBe('0')
  })

  it('shows nothing before any run', () => {
    expect(photoviewService.toSeedLabel(undefined)).toBeUndefined()
  })
})
