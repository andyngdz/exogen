import { StyleSection } from '@/types'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it } from 'vitest'
import { useGeneratorConfigStyleSearch } from '../useGeneratorConfigStyleSearch'

describe('useGeneratorConfigStyleSearch', () => {
  const mockStyleSections: StyleSection[] = [
    {
      id: 'photographic',
      styles: [
        {
          id: 'photo-1',
          name: 'Portrait',
          origin: 'Studio',
          license: 'MIT',
          positive: 'professional portrait photography',
          negative: 'blurry, low quality',
          image: '/images/photo-1.jpg'
        },
        {
          id: 'photo-2',
          name: 'Landscape',
          origin: 'Nature',
          license: 'CC0',
          positive: 'scenic landscape vista',
          image: '/images/photo-2.jpg'
        }
      ]
    },
    {
      id: 'anime',
      styles: [
        {
          id: 'anime-1',
          name: 'Chibi',
          origin: 'Manga',
          license: 'MIT',
          positive: 'cute chibi style anime',
          negative: 'realistic',
          image: '/images/anime-1.jpg'
        }
      ]
    }
  ]

  it('returns all sections when query is empty', () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    expect(result.current.query).toBe('')
    expect(result.current.filteredSections).toEqual(mockStyleSections)
    expect(result.current.hasResults).toBe(true)
  })

  it('filters styles by name (case-insensitive)', async () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    act(() => {
      result.current.setQuery('portrait')
    })

    await waitFor(() => {
      expect(result.current.filteredSections).toHaveLength(1)
      expect(result.current.filteredSections[0].id).toBe('photographic')
      expect(result.current.filteredSections[0].styles).toHaveLength(1)
      expect(result.current.filteredSections[0].styles[0].name).toBe('Portrait')
    })
  })

  it('filters styles by section id (category)', async () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    act(() => {
      result.current.setQuery('anime')
    })

    await waitFor(() => {
      expect(result.current.filteredSections).toHaveLength(1)
      expect(result.current.filteredSections[0].id).toBe('anime')
      expect(result.current.filteredSections[0].styles).toHaveLength(1)
    })
  })

  it('filters styles by positive prompt content', async () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    act(() => {
      result.current.setQuery('landscape vista')
    })

    await waitFor(() => {
      expect(result.current.filteredSections).toHaveLength(1)
      expect(result.current.filteredSections[0].styles[0].name).toBe(
        'Landscape'
      )
    })
  })

  it('filters styles by negative prompt content', async () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    act(() => {
      result.current.setQuery('blurry')
    })

    await waitFor(() => {
      expect(result.current.filteredSections).toHaveLength(1)
      expect(result.current.filteredSections[0].styles[0].name).toBe('Portrait')
    })
  })

  it('returns empty array when section matches but has no matching styles after filtering', async () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    act(() => {
      result.current.setQuery('nonexistent')
    })

    await waitFor(() => {
      expect(result.current.filteredSections).toHaveLength(0)
      expect(result.current.hasResults).toBe(false)
    })
  })

  it('returns all styles in section when section id matches', async () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    act(() => {
      result.current.setQuery('photographic')
    })

    await waitFor(() => {
      expect(result.current.filteredSections).toHaveLength(1)
      expect(result.current.filteredSections[0].styles).toHaveLength(2)
    })
  })

  it('handles undefined negative prompts gracefully', async () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    act(() => {
      result.current.setQuery('landscape')
    })

    await waitFor(() => {
      expect(result.current.filteredSections).toHaveLength(1)
    })
  })

  it('debounces search query updates', async () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    act(() => {
      result.current.setQuery('p')
    })

    expect(result.current.query).toBe('p')
    expect(result.current.filteredSections).toEqual(mockStyleSections)

    await waitFor(
      () => {
        expect(result.current.filteredSections).toHaveLength(1)
      },
      { timeout: 500 }
    )
  })

  it('updates query state immediately but filters with debounce', () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    act(() => {
      result.current.setQuery('portrait')
    })

    expect(result.current.query).toBe('portrait')
    expect(result.current.filteredSections).toEqual(mockStyleSections)
  })

  it('clears search by setting query to empty string', async () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    act(() => {
      result.current.setQuery('portrait')
    })

    await waitFor(() => {
      expect(result.current.filteredSections).toHaveLength(1)
    })

    act(() => {
      result.current.setQuery('')
    })

    await waitFor(() => {
      expect(result.current.filteredSections).toEqual(mockStyleSections)
      expect(result.current.hasResults).toBe(true)
    })
  })

  it('provides onClear function that resets query', async () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    act(() => {
      result.current.setQuery('portrait')
    })

    await waitFor(() => {
      expect(result.current.query).toBe('portrait')
    })

    act(() => {
      result.current.onClear()
    })

    expect(result.current.query).toBe('')

    await waitFor(() => {
      expect(result.current.filteredSections).toEqual(mockStyleSections)
    })
  })

  it('returns isEmptyState as false when query is empty', () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    expect(result.current.isEmptyState).toBe(false)
  })

  it('returns isEmptyState as false when query has results', async () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    act(() => {
      result.current.setQuery('portrait')
    })

    await waitFor(() => {
      expect(result.current.isEmptyState).toBe(false)
    })
  })

  it('returns isEmptyState as true when query has no results', async () => {
    const { result } = renderHook(() =>
      useGeneratorConfigStyleSearch(mockStyleSections)
    )

    act(() => {
      result.current.setQuery('nonexistent')
    })

    await waitFor(() => {
      expect(result.current.isEmptyState).toBe(true)
    })
  })
})
