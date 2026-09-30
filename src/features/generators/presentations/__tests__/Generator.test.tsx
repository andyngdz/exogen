import { GeneratorConfigFormValues } from '@/features/generator-configs'
import {
  useGenerationStatusStore,
  useUseImageGenerationStore
} from '@/features/generators'
import { useGeneratorPhotoviewStore } from '@/features/generator-photoview/states/useGeneratorPhotoviewStore'
import { act, render, screen } from '@testing-library/react'
import { UseFormReturn } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGeneratorForm } from '../../states/useGeneratorForm'
import { Generator } from '../Generator'
import { useMountedState } from 'react-use'

vi.mock('../GeneratorTopBar', () => ({
  GeneratorTopBar: () => <div data-testid="top-bar">TopBar</div>
}))

vi.mock('@/features/generator-stage', () => ({
  GeneratorStage: () => <div data-testid="stage">Stage</div>
}))

vi.mock('@/features/generator-dock', () => ({
  GeneratorDock: () => <div data-testid="dock">Dock</div>
}))

vi.mock('@/features/generator-inspector', () => ({
  GeneratorInspector: () => <div data-testid="inspector">Inspector</div>
}))

vi.mock('@/features/generator-photoview', () => ({
  GeneratorPhotoviewModal: () => (
    <div data-testid="generator-photoview-modal">GeneratorPhotoviewModal</div>
  )
}))

// Mock the state hooks
const mockMethods: Partial<UseFormReturn<GeneratorConfigFormValues>> = {
  watch: vi.fn(),
  handleSubmit: vi.fn(),
  getValues: vi.fn(),
  getFieldState: vi.fn(),
  setError: vi.fn(),
  clearErrors: vi.fn(),
  setValue: vi.fn(),
  trigger: vi.fn(),
  formState: {} as UseFormReturn<GeneratorConfigFormValues>['formState'],
  resetField: vi.fn(),
  reset: vi.fn(),
  setFocus: vi.fn(),
  unregister: vi.fn(),
  control: {} as UseFormReturn<GeneratorConfigFormValues>['control'],
  register: vi.fn(),
  subscribe: vi.fn()
}

vi.mock('../../states/useGeneratorForm', () => ({
  useGeneratorForm: vi.fn()
}))

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  FormProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-provider">{children}</div>
  )
}))

// Mock react-use to make useMountedState return true (mounted)
vi.mock('react-use', () => ({
  useMountedState: vi.fn()
}))

describe('Generator', () => {
  beforeEach(() => {
    vi.mocked(useGeneratorForm).mockReturnValue({
      methods: mockMethods as UseFormReturn<GeneratorConfigFormValues>
    })

    vi.mocked(useMountedState).mockReturnValue(() => true)

    useGenerationStatusStore.setState({ isGenerating: false })
    useUseImageGenerationStore.setState({
      items: [],
      imageStepEnds: [],
      nsfw_content_detected: []
    })
    useGeneratorPhotoviewStore.setState({ isOpen: false, currentIndex: 0 })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the top bar, stage, dock and inspector', () => {
    render(<Generator />)

    expect(screen.getByTestId('top-bar')).toBeInTheDocument()
    expect(screen.getByTestId('stage')).toBeInTheDocument()
    expect(screen.getByTestId('dock')).toBeInTheDocument()
    expect(screen.getByTestId('inspector')).toBeInTheDocument()
  })

  it('uses useGeneratorForm hook', () => {
    render(<Generator />)

    expect(useGeneratorForm).toHaveBeenCalled()
  })

  it('renders the form when mounted', () => {
    render(<Generator />)

    // Form should be visible immediately (because useMountedState returns true)
    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()

    // Progress indicator should not be visible
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('renders a progress indicator when not mounted yet', () => {
    vi.mocked(useMountedState).mockReturnValue(() => false)

    render(<Generator />)

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
  })

  it('prevents default form submission', () => {
    render(<Generator />)

    const form = screen.getByRole('form')
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })

    form.dispatchEvent(submitEvent)

    expect(submitEvent.defaultPrevented).toBe(true)
  })

  it('mounts photoview modal when not generating and images exist', () => {
    useUseImageGenerationStore.setState({
      items: [{ path: 'images/a.png', file_name: 'a.png' }],
      imageStepEnds: [],
      nsfw_content_detected: []
    })

    render(<Generator />)

    expect(screen.getByTestId('generator-photoview-modal')).toBeInTheDocument()
  })

  it('closes photoview when it is open and conditions become invalid', () => {
    useUseImageGenerationStore.setState({
      items: [{ path: 'images/a.png', file_name: 'a.png' }],
      imageStepEnds: [],
      nsfw_content_detected: []
    })
    useGeneratorPhotoviewStore.setState({ isOpen: true, currentIndex: 0 })

    const { rerender } = render(<Generator />)
    expect(useGeneratorPhotoviewStore.getState().isOpen).toBe(true)

    act(() => {
      useGenerationStatusStore.setState({ isGenerating: true })
    })

    rerender(<Generator />)

    expect(useGeneratorPhotoviewStore.getState().isOpen).toBe(false)
  })

  it('does not mount photoview modal when there are no images', () => {
    useUseImageGenerationStore.setState({
      items: [],
      imageStepEnds: [],
      nsfw_content_detected: []
    })

    render(<Generator />)

    expect(
      screen.queryByTestId('generator-photoview-modal')
    ).not.toBeInTheDocument()
  })
})
