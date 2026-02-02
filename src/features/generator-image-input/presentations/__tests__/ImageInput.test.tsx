import { useImage2ImageConfigStore } from '@/features/generators'
import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { createFileListLike } from '@/cores/test-utils'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImageInput } from '../ImageInput'

vi.mock('@heroui/react', () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Image: ({
    src,
    alt,
    classNames
  }: {
    src?: string
    alt?: string
    classNames?: { wrapper?: string; img?: string }
  }) => (
    <div className={classNames?.wrapper}>
      <img src={src} alt={alt} className={classNames?.img} />
    </div>
  ),
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

const FormWrapper = createGeneratorConfigFormWrapper()

describe('ImageInput', () => {
  afterEach(() => {
    useImage2ImageConfigStore.getState().reset()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
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
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(
      function (this: FileReader) {
        Object.defineProperty(this, 'result', {
          value: 'data:image/png;base64,abc',
          configurable: true
        })
        this.dispatchEvent(new ProgressEvent('load'))
      }
    )

    render(<ImageInput />, { wrapper: FormWrapper })

    const file = new File(['x'], 'test.png', { type: 'image/png' })
    const fileList = createFileListLike([file])
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

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
    const fileList = createFileListLike([file])
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    Object.defineProperty(input, 'files', { value: fileList })

    fireEvent.change(input)

    expect(
      screen.getByText('Only image files are supported')
    ).toBeInTheDocument()
  })

  it('clears error and opens file picker when clicked', async () => {
    render(<ImageInput />, { wrapper: FormWrapper })

    const file = new File(['x'], 'test.txt', { type: 'text/plain' })
    const fileList = createFileListLike([file])
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    Object.defineProperty(input, 'files', { value: fileList })

    fireEvent.change(input)

    expect(
      screen.getByText('Only image files are supported')
    ).toBeInTheDocument()

    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined)

    const clickTarget =
      screen.queryByText('Click to upload') ?? screen.getByAltText('Input')

    fireEvent.click(clickTarget)

    await waitFor(() => {
      expect(
        screen.queryByText('Only image files are supported')
      ).not.toBeInTheDocument()
    })

    expect(clickSpy).toHaveBeenCalled()
  })

  it('does not open file picker when loading', () => {
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(
      function () {
        // Intentionally never calls onload/onerror to keep loading state true.
      }
    )

    render(<ImageInput />, { wrapper: FormWrapper })

    const file = new File(['x'], 'test.png', { type: 'image/png' })
    const fileList = createFileListLike([file])
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    Object.defineProperty(input, 'files', { value: fileList })

    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined)

    fireEvent.change(input)

    const clickTarget =
      screen.queryByText('Click to upload') ?? screen.getByAltText('Input')

    fireEvent.click(clickTarget)

    expect(clickSpy).not.toHaveBeenCalled()
  })
})
