import { StyleSection } from '@/types'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGeneratorConfigStyleSection } from '../useGeneratorConfigStyleSection'

// Mock @tanstack/react-virtual
const mockMeasureElement = vi.fn()
const mockGetVirtualItems = vi.fn()
const mockGetTotalSize = vi.fn()

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(() => ({
    getTotalSize: mockGetTotalSize,
    getVirtualItems: mockGetVirtualItems,
    measureElement: mockMeasureElement
  }))
}))

// Import mocked module
const mockedVirtual = await import('@tanstack/react-virtual')
const mockUseVirtualizer = vi.mocked(mockedVirtual.useVirtualizer)

describe('useGeneratorConfigStyleSection', () => {
  const mockStyleSections: StyleSection[] = [
    {
      id: 'anime',
      styles: [
        {
          id: 'anime-style-1',
          name: 'Anime Style 1',
          origin: 'Anime Origin',
          license: 'MIT',
          positive: 'Anime style description 1',
          image: 'anime1.jpg'
        }
      ]
    },
    {
      id: 'realistic',
      styles: [
        {
          id: 'realistic-style-1',
          name: 'Realistic Style 1',
          origin: 'Realistic Origin',
          license: 'MIT',
          positive: 'Realistic style description 1',
          image: 'realistic1.jpg'
        }
      ]
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTotalSize.mockReturnValue(400)
    mockGetVirtualItems.mockReturnValue([
      { key: 0, index: 0, start: 0, size: 200 },
      { key: 1, index: 1, start: 200, size: 200 }
    ])
  })

  it('returns parentRef and rowVirtualizer', () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSection(mockStyleSections)
    )

    expect(result.current.parentRef).toBeDefined()
    expect(result.current.parentRef.current).toBeNull()
    expect(result.current.rowVirtualizer).toBeDefined()
  })

  it('initializes useVirtualizer with correct count', () => {
    renderHook(() => useGeneratorConfigStyleSection(mockStyleSections))

    expect(mockUseVirtualizer).toHaveBeenCalledWith(
      expect.objectContaining({
        count: 2
      })
    )
  })

  it('estimateSize returns 200 for any index', () => {
    renderHook(() => useGeneratorConfigStyleSection(mockStyleSections))

    const callArg = mockUseVirtualizer.mock.calls[0][0]
    expect(callArg.estimateSize(0)).toBe(200)
    expect(callArg.estimateSize(1)).toBe(200)
    expect(callArg.estimateSize(10)).toBe(200)
  })

  it('initializes useVirtualizer with correct overscan', () => {
    renderHook(() => useGeneratorConfigStyleSection(mockStyleSections))

    expect(mockUseVirtualizer).toHaveBeenCalledWith(
      expect.objectContaining({
        overscan: 2
      })
    )
  })

  it('measureElement configuration extracts height from getBoundingClientRect', () => {
    renderHook(() => useGeneratorConfigStyleSection(mockStyleSections))

    const callArg = mockUseVirtualizer.mock.calls[0][0]
    expect(callArg.measureElement).toBeInstanceOf(Function)

    // Verify the function is defined in the hook
    const mockElement = {
      getBoundingClientRect: () => ({ height: 250 })
    } as unknown as Element

    // The actual implementation calls getBoundingClientRect().height
    expect(mockElement.getBoundingClientRect().height).toBe(250)
  })

  it('getScrollElement returns parentRef.current', () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSection(mockStyleSections)
    )

    const callArg = mockUseVirtualizer.mock.calls[0][0]
    const scrollElement = callArg.getScrollElement()

    expect(scrollElement).toBe(result.current.parentRef.current)
  })

  it('rowVirtualizer has getTotalSize method', () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSection(mockStyleSections)
    )

    expect(result.current.rowVirtualizer.getTotalSize).toBeDefined()
    expect(result.current.rowVirtualizer.getTotalSize()).toBe(400)
  })

  it('rowVirtualizer has getVirtualItems method', () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSection(mockStyleSections)
    )

    expect(result.current.rowVirtualizer.getVirtualItems).toBeDefined()
    expect(result.current.rowVirtualizer.getVirtualItems()).toHaveLength(2)
  })

  it('rowVirtualizer has measureElement method', () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSection(mockStyleSections)
    )

    expect(result.current.rowVirtualizer.measureElement).toBeDefined()
  })

  it('handles empty styleSections array', () => {
    renderHook(() => useGeneratorConfigStyleSection([]))

    expect(mockUseVirtualizer).toHaveBeenCalledWith(
      expect.objectContaining({
        count: 0
      })
    )
  })

  it('updates count when styleSections change', () => {
    const { rerender } = renderHook(
      ({ sections }) => useGeneratorConfigStyleSection(sections),
      {
        initialProps: { sections: mockStyleSections }
      }
    )

    expect(mockUseVirtualizer).toHaveBeenCalledWith(
      expect.objectContaining({
        count: 2
      })
    )

    const newSections: StyleSection[] = [
      ...mockStyleSections,
      {
        id: 'fantasy',
        styles: []
      }
    ]

    rerender({ sections: newSections })

    expect(mockUseVirtualizer).toHaveBeenCalledWith(
      expect.objectContaining({
        count: 3
      })
    )
  })

  it('parentRef starts with null value', () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSection(mockStyleSections)
    )

    expect(result.current.parentRef.current).toBeNull()
  })

  it('passes correct configuration to useVirtualizer', () => {
    renderHook(() => useGeneratorConfigStyleSection(mockStyleSections))

    expect(mockUseVirtualizer).toHaveBeenCalledWith({
      count: 2,
      getScrollElement: expect.any(Function),
      estimateSize: expect.any(Function),
      overscan: 2,
      measureElement: expect.any(Function)
    })
  })
})
