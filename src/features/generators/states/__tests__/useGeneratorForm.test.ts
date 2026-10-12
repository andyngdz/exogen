import { describe, expect, it, vi, beforeEach } from 'vitest'
import { FORM_DEFAULT_VALUES } from '../../constants'
import type { GeneratorConfigFormValues } from '@/features/generator-configs'

// Mocks
const mockUseEffect = vi.fn((cb: () => void) => cb())
const mockUseForm = vi.fn()
const mockUseWatch = vi.fn()
const mockUseDeepCompareEffect = vi.fn((cb: () => void) => cb())
const mockUseLocalStorage = vi.fn()
const mockUseFormValuesStore = vi.fn()

vi.mock('react', async () => {
  const actual = await vi.importActual<object>('react')
  return {
    ...actual,
    useEffect: (...args: unknown[]) => mockUseEffect(...(args as [() => void]))
  }
})

vi.mock('react-hook-form', () => ({
  useForm: (...args: unknown[]) => mockUseForm(...args),
  useWatch: (...args: unknown[]) => mockUseWatch(...args)
}))

vi.mock('react-use', () => ({
  useDeepCompareEffect: (...args: unknown[]) =>
    mockUseDeepCompareEffect(...(args as [() => void])),
  useLocalStorage: (...args: unknown[]) => mockUseLocalStorage(...args)
}))

vi.mock('../useFormValuesStore', () => ({
  useFormValuesStore: (...args: unknown[]) => mockUseFormValuesStore(...args)
}))

// Import the hook under test AFTER mocks are set up
import { useGeneratorForm } from '../useGeneratorForm'

describe('useGeneratorForm', () => {
  const localStorageValues: GeneratorConfigFormValues = {
    ...FORM_DEFAULT_VALUES,
    prompt: 'from-local'
  }
  const watchedFormValues: GeneratorConfigFormValues = {
    ...FORM_DEFAULT_VALUES,
    prompt: 'watched'
  }
  const storeValues: GeneratorConfigFormValues = {
    ...FORM_DEFAULT_VALUES,
    prompt: 'from-store'
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // react-use: useLocalStorage returns tuple [value, setter]
    const setLocalStorage = vi.fn()
    mockUseLocalStorage.mockReturnValue([localStorageValues, setLocalStorage])

    // zustand store selector returns state.values
    mockUseFormValuesStore.mockImplementation(
      (selector: (s: { values?: GeneratorConfigFormValues }) => unknown) =>
        selector({ values: storeValues })
    )

    // react-hook-form: useForm methods
    mockUseForm.mockReturnValue({
      control: {},
      reset: vi.fn()
    })

    // react-hook-form: useWatch returns watched form values
    mockUseWatch.mockReturnValue(watchedFormValues)
  })

  it('initializes react-hook-form with localStorage default values and returns methods', () => {
    const { methods } = useGeneratorForm()

    expect(mockUseLocalStorage).toHaveBeenCalledWith(
      'generator-form-values',
      FORM_DEFAULT_VALUES
    )
    expect(mockUseForm).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'all',
        reValidateMode: 'onChange',
        defaultValues: localStorageValues
      })
    )
    expect(methods).toHaveProperty('control')
    expect(methods).toHaveProperty('reset')
  })

  it('persists watched form values to localStorage via useDeepCompareEffect', () => {
    useGeneratorForm()

    expect(mockUseWatch).toHaveBeenCalledWith(
      expect.objectContaining({
        control: expect.any(Object)
      })
    )
    const setLocalStorage = mockUseLocalStorage.mock.results[0].value[1]
    expect(setLocalStorage).toHaveBeenCalledWith(watchedFormValues)
  })

  it('resets form when store values change (useEffect)', () => {
    const { methods } = useGeneratorForm()

    expect(methods.reset).toHaveBeenCalledWith(storeValues)
  })

  it('clamps saved values above the slider ranges on load', () => {
    mockUseLocalStorage.mockReturnValue([
      { ...localStorageValues, number_of_images: 12, steps: 150 },
      vi.fn()
    ])

    useGeneratorForm()

    expect(mockUseForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: expect.objectContaining({
          number_of_images: 8,
          steps: 100
        })
      })
    )
  })

  it('clamps a reused history config before resetting the form', () => {
    mockUseFormValuesStore.mockImplementation(
      (selector: (s: { values?: GeneratorConfigFormValues }) => unknown) =>
        selector({ values: { ...storeValues, cfg_scale: 40 } })
    )

    const { methods } = useGeneratorForm()

    expect(methods.reset).toHaveBeenCalledWith(
      expect.objectContaining({ cfg_scale: 30 })
    )
  })
})
