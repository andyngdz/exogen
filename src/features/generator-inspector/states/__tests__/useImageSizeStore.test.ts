import { ModelFamily } from '@/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { IMAGE_SIZE_ACTIONS, useImageSizeStore } from '../useImageSizeStore'

const STORAGE_KEY = 'generator-image-size'

const saveFamily = (family: string) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ state: { family }, version: 0 })
  )
}

describe('useImageSizeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useImageSizeStore.setState({
      family: ModelFamily.UNKNOWN,
      isCustomChosen: false
    })
  })

  it('saves only the family', () => {
    IMAGE_SIZE_ACTIONS.setFamily(ModelFamily.SDXL)
    IMAGE_SIZE_ACTIONS.setCustomChosen(true)

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')

    expect(saved.state).toEqual({ family: ModelFamily.SDXL })
  })

  it('restores the saved family on launch', async () => {
    saveFamily(ModelFamily.SDXL)

    await useImageSizeStore.persist.rehydrate()

    expect(useImageSizeStore.getState().family).toBe(ModelFamily.SDXL)
  })

  it('keeps UNKNOWN when the saved family is not a known one', async () => {
    saveFamily('sd99')

    await useImageSizeStore.persist.rehydrate()

    expect(useImageSizeStore.getState().family).toBe(ModelFamily.UNKNOWN)
  })
})
