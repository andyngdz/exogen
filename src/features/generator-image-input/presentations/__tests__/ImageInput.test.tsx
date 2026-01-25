import { useImage2ImageConfigStore } from '@/features/generators'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImageInput } from '../ImageInput'

vi.mock('@heroui/react', () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Button: ({
    children,
    onPress,
    as
  }: {
    children: ReactNode
    onPress?: VoidFunction
    as?: string
  }) =>
    // Allow rendering as a label to support nested <input type="file" />.
    as === 'label' ? (
      <label>
        {children}
        <span onClick={onPress} />
      </label>
    ) : (
      <button type="button" onClick={onPress}>
        {children}
      </button>
    ),
  Spinner: () => <div />
}))

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

    render(<ImageInput />)

    expect(screen.getByAltText('Input')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Remove'))

    expect(useImage2ImageConfigStore.getState().initImageBase64).toBeUndefined()
  })

  it('sets image base64 on file upload', () => {
    vi.stubGlobal('FileReader', MockFileReader)

    render(<ImageInput />)

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
})
