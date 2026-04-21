import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ImageViewMode, useImageViewModeStore } from '../useImageViewModeStore'

const defaultViewMode: ImageViewMode = 'grid'

afterEach(() => {
  // Reset store to initial state after each test
  const { result } = renderHook(() => useImageViewModeStore())
  act(() => {
    result.current.setViewMode(defaultViewMode)
  })
})

describe('useImageViewModeStore - initialization', () => {
  it('should initialize with default view mode', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    expect(result.current.viewMode).toBe(defaultViewMode)
    expect(result.current.viewMode).toBe('grid')
  })

  it('should provide setViewMode function', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    expect(result.current.setViewMode).toBeDefined()
    expect(typeof result.current.setViewMode).toBe('function')
  })

  it('should have correct initial state structure', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    expect(result.current).toHaveProperty('viewMode')
    expect(result.current).toHaveProperty('setViewMode')
  })
})

describe('useImageViewModeStore - setViewMode', () => {
  it('should update view mode to slider', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    act(() => {
      result.current.setViewMode('slider')
    })

    expect(result.current.viewMode).toBe('slider')
  })

  it('should update view mode to grid', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    // First set to slider
    act(() => {
      result.current.setViewMode('slider')
    })

    expect(result.current.viewMode).toBe('slider')

    // Then set back to grid
    act(() => {
      result.current.setViewMode('grid')
    })

    expect(result.current.viewMode).toBe('grid')
  })

  it('should handle multiple sequential updates', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    act(() => {
      result.current.setViewMode('slider')
    })
    expect(result.current.viewMode).toBe('slider')

    act(() => {
      result.current.setViewMode('grid')
    })
    expect(result.current.viewMode).toBe('grid')

    act(() => {
      result.current.setViewMode('slider')
    })
    expect(result.current.viewMode).toBe('slider')

    act(() => {
      result.current.setViewMode('grid')
    })
    expect(result.current.viewMode).toBe('grid')
  })

  it('should allow setting same mode multiple times', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    act(() => {
      result.current.setViewMode('slider')
    })

    expect(result.current.viewMode).toBe('slider')

    act(() => {
      result.current.setViewMode('slider')
    })

    expect(result.current.viewMode).toBe('slider')
  })

  it('should maintain state after multiple operations', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    // Perform several state changes
    act(() => {
      result.current.setViewMode('slider')
    })

    act(() => {
      result.current.setViewMode('grid')
    })

    act(() => {
      result.current.setViewMode('slider')
    })

    expect(result.current.viewMode).toBe('slider')
  })
})

describe('useImageViewModeStore - type safety', () => {
  it('should enforce ImageViewMode type for setViewMode parameter', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    act(() => {
      result.current.setViewMode('grid')
    })
    expect(result.current.viewMode).toBe('grid')

    act(() => {
      result.current.setViewMode('slider')
    })
    expect(result.current.viewMode).toBe('slider')
  })

  it('should maintain type consistency across operations', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    // Initial state should be correct type
    expect(typeof result.current.viewMode).toBe('string')
    expect(['grid', 'slider']).toContain(result.current.viewMode)

    act(() => {
      result.current.setViewMode('slider')
    })

    // After update, type should remain consistent
    expect(typeof result.current.viewMode).toBe('string')
    expect(['grid', 'slider']).toContain(result.current.viewMode)
  })

  it('should return correct interface structure', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    // Verify interface compliance
    expect(result.current).toHaveProperty('viewMode')
    expect(result.current).toHaveProperty('setViewMode')

    // Verify types
    expect(typeof result.current.viewMode).toBe('string')
    expect(typeof result.current.setViewMode).toBe('function')
  })
})

describe('useImageViewModeStore - state sharing', () => {
  it('should share state across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useImageViewModeStore())
    const { result: result2 } = renderHook(() => useImageViewModeStore())

    // Both should start with the same initial state
    expect(result1.current.viewMode).toBe(result2.current.viewMode)
    expect(result1.current.viewMode).toBe('grid')

    // Update through first instance
    act(() => {
      result1.current.setViewMode('slider')
    })

    // Both should reflect the change
    expect(result1.current.viewMode).toBe('slider')
    expect(result2.current.viewMode).toBe('slider')

    // Update through second instance
    act(() => {
      result2.current.setViewMode('grid')
    })

    // Both should reflect the change
    expect(result1.current.viewMode).toBe('grid')
    expect(result2.current.viewMode).toBe('grid')
  })

  it('should maintain consistency across multiple subscribers', () => {
    const { result: result1 } = renderHook(() => useImageViewModeStore())
    const { result: result2 } = renderHook(() => useImageViewModeStore())
    const { result: result3 } = renderHook(() => useImageViewModeStore())

    const testMode: ImageViewMode = 'slider'

    act(() => {
      result1.current.setViewMode(testMode)
    })

    expect(result1.current.viewMode).toBe(testMode)
    expect(result2.current.viewMode).toBe(testMode)
    expect(result3.current.viewMode).toBe(testMode)
  })
})

describe('useImageViewModeStore - performance', () => {
  it('should trigger re-renders when state changes', () => {
    const { result } = renderHook(() => useImageViewModeStore())
    const initialMode = result.current.viewMode

    act(() => {
      result.current.setViewMode('slider')
    })

    expect(result.current.viewMode).not.toBe(initialMode)
    expect(result.current.viewMode).toBe('slider')
  })

  it('should maintain referential stability for setViewMode function', () => {
    const { result, rerender } = renderHook(() => useImageViewModeStore())
    const initialSetViewMode = result.current.setViewMode

    rerender()

    expect(result.current.setViewMode).toBe(initialSetViewMode)
  })

  it('should handle rapid state changes', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    // Simulate rapid toggling - 10 alternating changes
    for (let i = 0; i < 10; i++) {
      const mode: ImageViewMode = i % 2 === 0 ? 'grid' : 'slider'
      act(() => {
        result.current.setViewMode(mode)
      })
      expect(result.current.viewMode).toBe(mode)
    }

    // Final state should be slider (i=9, 9%2=1)
    expect(result.current.viewMode).toBe('slider')
  })
})

describe('useImageViewModeStore - integration', () => {
  it('should handle realistic view mode switching workflow', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    // User starts with default grid view
    expect(result.current.viewMode).toBe('grid')

    // User switches to slider view
    act(() => {
      result.current.setViewMode('slider')
    })

    expect(result.current.viewMode).toBe('slider')

    // User switches back to grid view
    act(() => {
      result.current.setViewMode('grid')
    })

    expect(result.current.viewMode).toBe('grid')

    // User switches to slider again
    act(() => {
      result.current.setViewMode('slider')
    })

    expect(result.current.viewMode).toBe('slider')
  })

  it('should work correctly in component lifecycle scenarios', () => {
    const { result, unmount, rerender } = renderHook(() =>
      useImageViewModeStore()
    )

    // Set initial state
    act(() => {
      result.current.setViewMode('slider')
    })

    expect(result.current.viewMode).toBe('slider')

    // Rerender component (simulates re-render)
    rerender()

    expect(result.current.viewMode).toBe('slider')

    // Update state after rerender
    act(() => {
      result.current.setViewMode('grid')
    })

    expect(result.current.viewMode).toBe('grid')

    // Unmount and remount (state should persist due to Zustand global store)
    unmount()

    const { result: newResult } = renderHook(() => useImageViewModeStore())
    expect(newResult.current.viewMode).toBe('grid')
  })
})

describe('useImageViewModeStore - edge cases', () => {
  it('should handle setting the same mode consecutively', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    const mode: ImageViewMode = 'slider'

    act(() => {
      result.current.setViewMode(mode)
    })

    expect(result.current.viewMode).toBe(mode)

    act(() => {
      result.current.setViewMode(mode)
    })

    expect(result.current.viewMode).toBe(mode)
  })

  it('should maintain state integrity during stress test', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    let lastMode: ImageViewMode = 'grid'

    // Perform many state changes rapidly
    for (let i = 0; i < 100; i++) {
      const mode: ImageViewMode = i % 2 === 0 ? 'grid' : 'slider'
      lastMode = mode

      act(() => {
        result.current.setViewMode(mode)
      })

      expect(result.current.viewMode).toBe(mode)
    }

    // Final state should be the last mode set (i=99, 99%2=1, so 'slider')
    expect(result.current.viewMode).toBe(lastMode)
    expect(result.current.viewMode).toBe('slider')
  })
})

describe('useImageViewModeStore - type validation', () => {
  it('should work with all valid ImageViewMode values', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    act(() => {
      result.current.setViewMode('grid')
    })
    expect(result.current.viewMode).toBe('grid')
    expect(['grid', 'slider']).toContain(result.current.viewMode)

    act(() => {
      result.current.setViewMode('slider')
    })
    expect(result.current.viewMode).toBe('slider')
    expect(['grid', 'slider']).toContain(result.current.viewMode)
  })

  it('should maintain type constraints throughout operations', () => {
    const { result } = renderHook(() => useImageViewModeStore())

    // Test that the store only accepts valid enum values
    act(() => {
      result.current.setViewMode('grid')
    })
    expect(['grid', 'slider']).toContain(result.current.viewMode)

    act(() => {
      result.current.setViewMode('slider')
    })
    expect(['grid', 'slider']).toContain(result.current.viewMode)

    act(() => {
      result.current.setViewMode('grid')
    })
    expect(['grid', 'slider']).toContain(result.current.viewMode)

    act(() => {
      result.current.setViewMode('slider')
    })
    expect(['grid', 'slider']).toContain(result.current.viewMode)
  })
})
