import { SliderChangeValue } from '@/types'
import { first, isArray } from 'es-toolkit/compat'

class SliderChangeService {
  /** Returns the value of a single-thumb slider, reading the first thumb of a range. */
  toSingle(value: SliderChangeValue): number {
    if (isArray(value)) return first(value) ?? 0

    return value
  }
}

export const sliderChangeService = new SliderChangeService()
