import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFormContext } from 'react-hook-form'
import { useLocalStorage } from 'react-use'

import { useStyleSections } from '@/cores/hooks/useStyleSections'
import type { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import type { StyleItem } from '@/types'

import { useDefaultStyles } from '../useDefaultStyles'

// Mock dependencies
vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn()
}))

vi.mock('@/cores/hooks/useStyleSections', () => ({
  useStyleSections: vi.fn()
}))

vi.mock('react-use', () => ({
  useLocalStorage: vi.fn()
}))

vi.mock('es-toolkit/compat', async () => {
  const actual =
    await vi.importActual<typeof import('es-toolkit/compat')>(
      'es-toolkit/compat'
    )
  return {
    isEmpty: actual.isEmpty
  }
})

describe('useDefaultStyles', () => {
  let mockSetValue: ReturnType<typeof vi.fn>
  let mockWatch: ReturnType<typeof vi.fn>
  let mockStyleItems: StyleItem[]
  let mockSetDefaultsApplied: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockSetValue = vi.fn()
    mockWatch = vi.fn()
    mockStyleItems = []
    mockSetDefaultsApplied = vi.fn()

    vi.mocked(useFormContext<GeneratorConfigFormValues>).mockReturnValue({
      setValue: mockSetValue,
      watch: mockWatch
    } as unknown as ReturnType<
      typeof useFormContext<GeneratorConfigFormValues>
    >)

    vi.mocked(useStyleSections).mockReturnValue({
      styleItems: mockStyleItems,
      styleSections: [],
      isLoading: false,
      error: null
    })

    // Default: defaults not yet applied
    vi.mocked(useLocalStorage).mockReturnValue([
      false,
      mockSetDefaultsApplied as unknown as (value: unknown) => void,
      vi.fn()
    ])
  })

  it('applies defaults on first visit when styles empty', () => {
    mockWatch.mockReturnValue([])
    mockStyleItems = [
      { id: 'fooocus_masterpiece', name: 'Masterpiece' } as StyleItem,
      { id: 'fooocus_negative', name: 'Negative' } as StyleItem
    ]

    vi.mocked(useStyleSections).mockReturnValue({
      styleItems: mockStyleItems,
      styleSections: [],
      isLoading: false,
      error: null
    })

    renderHook(() => useDefaultStyles())

    expect(mockSetValue).toHaveBeenCalledWith('styles', [
      'fooocus_masterpiece',
      'fooocus_negative'
    ])
    expect(mockSetDefaultsApplied).toHaveBeenCalledWith(true)
  })

  it('does not apply defaults when styles already exist', () => {
    mockWatch.mockReturnValue(['custom-style'])
    mockStyleItems = [
      { id: 'fooocus_masterpiece', name: 'Masterpiece' } as StyleItem,
      { id: 'fooocus_negative', name: 'Negative' } as StyleItem
    ]

    vi.mocked(useStyleSections).mockReturnValue({
      styleItems: mockStyleItems,
      styleSections: [],
      isLoading: false,
      error: null
    })

    renderHook(() => useDefaultStyles())

    expect(mockSetValue).not.toHaveBeenCalled()
    expect(mockSetDefaultsApplied).not.toHaveBeenCalled()
  })

  it('does not re-apply when defaults already applied (persisted)', () => {
    mockWatch.mockReturnValue([])
    mockStyleItems = [
      { id: 'fooocus_masterpiece', name: 'Masterpiece' } as StyleItem,
      { id: 'fooocus_negative', name: 'Negative' } as StyleItem
    ]

    vi.mocked(useStyleSections).mockReturnValue({
      styleItems: mockStyleItems,
      styleSections: [],
      isLoading: false,
      error: null
    })

    // Simulate localStorage indicating defaults were already applied
    vi.mocked(useLocalStorage).mockReturnValue([
      true,
      mockSetDefaultsApplied as unknown as (value: unknown) => void,
      vi.fn()
    ])

    renderHook(() => useDefaultStyles())

    expect(mockSetValue).not.toHaveBeenCalled()
    expect(mockSetDefaultsApplied).not.toHaveBeenCalled()
  })

  it('filters out non-existent styles silently', () => {
    mockWatch.mockReturnValue([])
    mockStyleItems = [
      { id: 'fooocus_masterpiece', name: 'Masterpiece' } as StyleItem
    ]

    vi.mocked(useStyleSections).mockReturnValue({
      styleItems: mockStyleItems,
      styleSections: [],
      isLoading: false,
      error: null
    })

    renderHook(() => useDefaultStyles())

    expect(mockSetValue).toHaveBeenCalledWith('styles', ['fooocus_masterpiece'])
    expect(mockSetDefaultsApplied).toHaveBeenCalledWith(true)
  })

  it('does not apply if all default styles are missing', () => {
    mockWatch.mockReturnValue([])
    mockStyleItems = [{ id: 'other-style', name: 'Other' } as StyleItem]

    vi.mocked(useStyleSections).mockReturnValue({
      styleItems: mockStyleItems,
      styleSections: [],
      isLoading: false,
      error: null
    })

    renderHook(() => useDefaultStyles())

    expect(mockSetValue).not.toHaveBeenCalled()
    expect(mockSetDefaultsApplied).not.toHaveBeenCalled()
  })

  it('handles empty styleItems gracefully', () => {
    mockWatch.mockReturnValue([])
    mockStyleItems = []

    vi.mocked(useStyleSections).mockReturnValue({
      styleItems: mockStyleItems,
      styleSections: [],
      isLoading: false,
      error: null
    })

    expect(() => renderHook(() => useDefaultStyles())).not.toThrow()
    expect(mockSetValue).not.toHaveBeenCalled()
    expect(mockSetDefaultsApplied).not.toHaveBeenCalled()
  })
})
