import { useImage2ImageConfigStore } from '@/features/generators'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImageInput } from '../ImageInput'
import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'

vi.mock('@heroui/react', () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Button: ({
    children,
    onPress,
    as,
    isDisabled,
    'aria-label': ariaLabel
  }: {
    children: ReactNode
    onPress?: VoidFunction
    as?: string
    isDisabled?: boolean
    'aria-label'?: string
  }) =>
    // Allow rendering as a label to support nested <input type="file" />.
    as === 'label' ? (
      <label>
        {children}
        <span onClick={onPress} />
      </label>
    ) : (
      <button
        type="button"
        onClick={onPress}
        disabled={isDisabled}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    ),
  Spinner: () => <div />
}))

const FormWrapper = ({ children }: { children: ReactNode }) => {
  const methods = useForm<GeneratorConfigFormValues>({
    defaultValues: {
      cfg_scale: 7,
      clip_skip: 1,
      height: 512,
      loras: [],
      negative_prompt: '',
      number_of_images: 1,
      prompt: '',
      sampler: 'Euler',
      seed: 0,
      steps: 20,
      styles: [],
      width: 512
    }
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

class MockFileReader {
  result: string | ArrayBuffer | null = null
  onload:
    | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
    | null = null
  onerror:
    | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
    | null = null
  error: DOMException | null = null

  readAsDataURL(_file: File) {
    this.result = 'data:image/png;base64,abc'
    this.onload?.call(
      this as unknown as FileReader,
      {} as ProgressEvent<FileReader>
    )
  }
}

describe('ImageInput', () => {
  afterEach(() => {
    useImage2ImageConfigStore.getState().reset()
    vi.restoreAllMocks()
  })

  it('renders preview and removes image', () => {
    useImage2ImageConfigStore
      .getState()
      .setInitImageBase64('data:image/png;base64,preview')

    render(<ImageInput />, { wrapper: FormWrapper })

    expect(screen.getByAltText('Input')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Remove input image'))

    expect(useImage2ImageConfigStore.getState().initImageBase64).toBeUndefined()
  })

  it('sets image base64 on file upload', () => {
    vi.stubGlobal('FileReader', MockFileReader)

    render(<ImageInput />, { wrapper: FormWrapper })

    const file = new File(['x'], 'test.png', { type: 'image/png' })
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null)
    } as unknown as FileList

    Object.defineProperty(input, 'files', { value: fileList })

    fireEvent.change(input)

    return waitFor(() => {
      expect(useImage2ImageConfigStore.getState().initImageBase64).toBe(
        'data:image/png;base64,abc'
      )
    })
  })

  it('shows error when non-image is selected', () => {
    render(<ImageInput />, { wrapper: FormWrapper })

    const file = new File(['x'], 'test.txt', { type: 'text/plain' })
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null)
    } as unknown as FileList

    Object.defineProperty(input, 'files', { value: fileList })

    fireEvent.change(input)

    expect(
      screen.getByText('Only image files are supported')
    ).toBeInTheDocument()
  })
})
