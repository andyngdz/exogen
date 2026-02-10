import { describe, expect, it, vi } from 'vitest'

import { Image2ImageResizeMode } from '@/types'
import { useImage2ImageConfigStore } from '../useImage2ImageConfigStore'

describe('useImage2ImageConfigStore', () => {
  it('partializes persisted values (strength, resizeMode only)', () => {
    useImage2ImageConfigStore.getState().setStrength(0.42)
    useImage2ImageConfigStore
      .getState()
      .setResizeMode(Image2ImageResizeMode.CROP)
    useImage2ImageConfigStore
      .getState()
      .setInitImageBase64('data:image/png;base64,abc')

    const persist = useImage2ImageConfigStore.persist
    expect(persist).toBeDefined()

    const partialize = persist.getOptions().partialize
    if (!partialize) {
      throw new Error('persist partialize not available')
    }

    const partial = partialize(useImage2ImageConfigStore.getState())

    expect(partial).toEqual({
      strength: 0.42,
      resizeMode: Image2ImageResizeMode.CROP
    })
  })

  it('persists only strength and resizeMode to storage', () => {
    const persist = useImage2ImageConfigStore.persist
    if (!persist) {
      throw new Error('persist middleware not available')
    }

    const previousOptions = persist.getOptions()
    const baseStorage = previousOptions.storage
    if (!baseStorage) {
      throw new Error('persist storage not available')
    }

    const setItem = vi.fn<(name: string, value: unknown) => void>()
    let lastStoredValue: unknown

    const storage = {
      ...baseStorage,
      setItem: (
        name: string,
        value: Parameters<typeof baseStorage.setItem>[1]
      ) => {
        lastStoredValue = value
        setItem(name, value)
        return baseStorage.setItem(name, value)
      }
    }

    persist.setOptions({
      storage
    })

    useImage2ImageConfigStore.getState().setStrength(0.33)
    useImage2ImageConfigStore
      .getState()
      .setResizeMode(Image2ImageResizeMode.RESIZE)
    useImage2ImageConfigStore
      .getState()
      .setInitImageBase64('data:image/png;base64,secret')

    expect(setItem).toHaveBeenCalled()
    expect(lastStoredValue).toBeDefined()

    const persisted = lastStoredValue as {
      state?: unknown
      version?: unknown
    }

    expect(persisted.state).toEqual({
      strength: 0.33,
      resizeMode: Image2ImageResizeMode.RESIZE
    })
    expect(persisted.state).not.toHaveProperty('initImageBase64')

    persist.setOptions(previousOptions)
  })
})
