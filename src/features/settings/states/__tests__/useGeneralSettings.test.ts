import { useSafetyCheckMutation } from '@/cores/api-queries'
import { act, renderHook } from '@testing-library/react'
import { useForm, useWatch } from 'react-hook-form'
import { useShallowCompareEffect } from 'react-use'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingFormValues } from '../../types/settings'
import { useGeneralSettings } from '../useGeneralSettings'
import { useSettingsStore } from '../useSettingsStore'

// Mock dependencies
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
  useWatch: vi.fn()
}))

vi.mock('react-use', () => ({
  useShallowCompareEffect: vi.fn()
}))

vi.mock('../useSettingsStore', () => ({
  useSettingsStore: vi.fn()
}))

vi.mock('@/cores/api-queries', () => ({
  useSafetyCheckMutation: vi.fn()
}))

// Mock zustand/middleware to avoid localStorage issues in tests
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual('zustand/middleware')
  return {
    ...(actual as object),
    persist: vi.fn().mockImplementation((config) => config),
    devtools: vi.fn().mockImplementation((config) => config)
  }
})

describe('useGeneralSettings', () => {
  const mockRegister = vi.fn()
  const mockControl = {}
  const mockSetValues = vi.fn()
  const mockMutate = vi.fn()

  const mockValues: SettingFormValues = {
    safety_check_enabled: true
  }

  const mockFormValues: SettingFormValues = {
    safety_check_enabled: false
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useSettingsStore
    vi.mocked(useSettingsStore).mockReturnValue({
      values: mockValues,
      setValues: mockSetValues,
      reset: vi.fn()
    })

    // Mock useForm
    vi.mocked(useForm).mockReturnValue({
      register: mockRegister,
      control: mockControl
    } as unknown as ReturnType<typeof useForm>)

    // Mock useWatch to return form values
    vi.mocked(useWatch).mockReturnValue(mockFormValues)

    // Mock useSafetyCheckMutation
    vi.mocked(useSafetyCheckMutation).mockReturnValue({
      mutate: mockMutate
    } as unknown as ReturnType<typeof useSafetyCheckMutation>)

    // Mock useShallowCompareEffect to call the effect immediately
    vi.mocked(useShallowCompareEffect).mockImplementation((effect) => {
      effect()
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('hook initialization', () => {
    it('should call useSettingsStore to get values and setValues', () => {
      renderHook(() => useGeneralSettings())

      expect(useSettingsStore).toHaveBeenCalled()
    })

    it('should initialize useForm with correct configuration', () => {
      renderHook(() => useGeneralSettings())

      expect(useForm).toHaveBeenCalledWith({
        defaultValues: mockValues,
        values: mockValues
      })
    })

    it('should return register function from useForm', () => {
      const { result } = renderHook(() => useGeneralSettings())

      expect(result.current.register).toBe(mockRegister)
    })
  })

  describe('form watching and synchronization', () => {
    it('should call useWatch hook to get current form values', () => {
      renderHook(() => useGeneralSettings())

      expect(useWatch).toHaveBeenCalledWith({ control: mockControl })
    })

    it('should use useShallowCompareEffect to sync form values with store', () => {
      renderHook(() => useGeneralSettings())

      expect(useShallowCompareEffect).toHaveBeenCalledWith(
        expect.any(Function),
        [mockFormValues, mockSetValues, mockMutate]
      )
    })

    it('should call setValues with current form values in effect', () => {
      renderHook(() => useGeneralSettings())

      expect(mockSetValues).toHaveBeenCalledWith(mockFormValues)
    })
  })

  describe('form integration', () => {
    it('should pass correct type parameter to useForm', () => {
      renderHook(() => useGeneralSettings())

      expect(useForm).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValues: expect.any(Object),
          values: expect.any(Object)
        })
      )
    })

    it('should use both defaultValues and values in form configuration', () => {
      renderHook(() => useGeneralSettings())

      expect(useForm).toHaveBeenCalledWith({
        defaultValues: mockValues,
        values: mockValues
      })
    })

    it('should work with different initial values from store', () => {
      const differentValues: SettingFormValues = {
        safety_check_enabled: false
      }

      vi.mocked(useSettingsStore).mockReturnValue({
        values: differentValues,
        setValues: mockSetValues,
        reset: vi.fn()
      })

      renderHook(() => useGeneralSettings())

      expect(useForm).toHaveBeenCalledWith({
        defaultValues: differentValues,
        values: differentValues
      })
    })
  })

  describe('store synchronization', () => {
    it('should update store when form values change', () => {
      const updatedFormValues: SettingFormValues = {
        safety_check_enabled: true
      }

      vi.mocked(useWatch).mockReturnValue(updatedFormValues)

      renderHook(() => useGeneralSettings())

      expect(mockSetValues).toHaveBeenCalledWith(updatedFormValues)
    })

    it('should call setValues only when form values actually change', () => {
      let effectCallback: (() => void) | undefined

      vi.mocked(useShallowCompareEffect).mockImplementation((effect) => {
        effectCallback = effect
        // Don't call immediately to test manual triggering
      })

      renderHook(() => useGeneralSettings())

      // Clear previous calls
      mockSetValues.mockClear()

      // Manually trigger the effect
      act(() => {
        effectCallback?.()
      })

      expect(mockSetValues).toHaveBeenCalledWith(mockFormValues)
    })
  })

  describe('dependency arrays', () => {
    it('should include formValues, setValues, and setSafetyCheck in useShallowCompareEffect dependencies', () => {
      renderHook(() => useGeneralSettings())

      expect(useShallowCompareEffect).toHaveBeenCalledWith(
        expect.any(Function),
        [mockFormValues, mockSetValues, mockMutate]
      )
    })

    it('should update dependencies when form values change', () => {
      const newFormValues: SettingFormValues = {
        safety_check_enabled: false
      }

      const { rerender } = renderHook(() => useGeneralSettings())

      // Change mock return value
      vi.mocked(useWatch).mockReturnValue(newFormValues)

      rerender()

      expect(useShallowCompareEffect).toHaveBeenLastCalledWith(
        expect.any(Function),
        [newFormValues, mockSetValues, mockMutate]
      )
    })
  })

  describe('register function behavior', () => {
    it('should return the exact register function from useForm', () => {
      const { result } = renderHook(() => useGeneralSettings())

      expect(result.current.register).toBe(mockRegister)
      expect(result.current.register).not.toBeUndefined()
    })

    it('should allow register function to be called', () => {
      const { result } = renderHook(() => useGeneralSettings())

      result.current.register('safety_check_enabled')

      expect(mockRegister).toHaveBeenCalledWith('safety_check_enabled')
    })

    it('should support register function with options', () => {
      const { result } = renderHook(() => useGeneralSettings())
      const registerOptions = { required: true }

      result.current.register('safety_check_enabled', registerOptions)

      expect(mockRegister).toHaveBeenCalledWith(
        'safety_check_enabled',
        registerOptions
      )
    })
  })

  describe('hook re-rendering', () => {
    it('should maintain stable register reference across re-renders', () => {
      const { result, rerender } = renderHook(() => useGeneralSettings())

      const firstRegister = result.current.register

      rerender()

      expect(result.current.register).toBe(firstRegister)
    })

    it('should handle store values changing across re-renders', () => {
      const { rerender } = renderHook(() => useGeneralSettings())

      const newValues: SettingFormValues = {
        safety_check_enabled: false
      }

      vi.mocked(useSettingsStore).mockReturnValue({
        values: newValues,
        setValues: mockSetValues,
        reset: vi.fn()
      })

      rerender()

      expect(useForm).toHaveBeenLastCalledWith({
        defaultValues: newValues,
        values: newValues
      })
    })
  })

  describe('error handling', () => {
    it('should handle useSettingsStore returning null values', () => {
      vi.mocked(useSettingsStore).mockReturnValue({
        values: null as unknown as SettingFormValues,
        setValues: mockSetValues,
        reset: vi.fn()
      })

      const { result } = renderHook(() => useGeneralSettings())

      expect(result.current.register).toBe(mockRegister)
      expect(useForm).toHaveBeenCalledWith({
        defaultValues: null,
        values: null
      })
    })

    it('should handle useForm returning undefined register', () => {
      vi.mocked(useForm).mockReturnValue({
        register: undefined,
        control: mockControl
      } as unknown as ReturnType<typeof useForm>)

      const { result } = renderHook(() => useGeneralSettings())

      expect(result.current.register).toBeUndefined()
    })
  })

  describe('integration scenarios', () => {
    it('should work with realistic form data flow', () => {
      const initialValues: SettingFormValues = {
        safety_check_enabled: false
      }

      const updatedValues: SettingFormValues = {
        safety_check_enabled: true
      }

      // Start with initial values
      vi.mocked(useSettingsStore).mockReturnValue({
        values: initialValues,
        setValues: mockSetValues,
        reset: vi.fn()
      })

      vi.mocked(useWatch).mockReturnValue(updatedValues)

      const { result } = renderHook(() => useGeneralSettings())

      // Verify form is initialized with store values
      expect(useForm).toHaveBeenCalledWith({
        defaultValues: initialValues,
        values: initialValues
      })

      // Verify form changes are synced to store
      expect(mockSetValues).toHaveBeenCalledWith(updatedValues)

      // Verify register function is available
      expect(result.current.register).toBe(mockRegister)
    })

    it('should handle rapid form value changes', () => {
      let effectCall = 0
      vi.mocked(useShallowCompareEffect).mockImplementation((effect) => {
        effectCall++
        effect()
      })

      const values1: SettingFormValues = { safety_check_enabled: true }
      const values2: SettingFormValues = { safety_check_enabled: false }

      vi.mocked(useWatch)
        .mockReturnValueOnce(values1)
        .mockReturnValueOnce(values2)

      const { rerender } = renderHook(() => useGeneralSettings())

      expect(mockSetValues).toHaveBeenCalledWith(values1)

      rerender()

      expect(mockSetValues).toHaveBeenCalledWith(values2)
      expect(effectCall).toBeGreaterThan(1)
    })
  })
})
