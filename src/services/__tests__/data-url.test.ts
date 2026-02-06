import { afterEach, describe, expect, it, vi } from 'vitest'

import { dataUrlService } from '../data-url'

type FileReaderBehavior = {
  result?: string | ArrayBuffer | null
  error?: DOMException | null
  triggerError?: boolean
}

const setMockFileReader = (behavior: FileReaderBehavior) => {
  class MockFileReader {
    result: string | ArrayBuffer | null = behavior.result ?? null
    error: DOMException | null = behavior.error ?? null
    onload:
      | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
      | null = null
    onerror:
      | ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown)
      | null = null

    readAsDataURL(_blob: Blob) {
      if (behavior.triggerError) {
        this.onerror?.call(
          this as unknown as FileReader,
          {} as ProgressEvent<FileReader>
        )
        return
      }

      this.onload?.call(
        this as unknown as FileReader,
        {} as ProgressEvent<FileReader>
      )
    }
  }

  vi.stubGlobal('FileReader', MockFileReader)
}

describe('dataUrlService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('converts blob to data url', async () => {
    setMockFileReader({ result: 'data:image/png;base64,abc' })

    const blob = new Blob(['abc'], { type: 'image/png' })
    await expect(dataUrlService.blobToDataUrl(blob)).resolves.toBe(
      'data:image/png;base64,abc'
    )
  })

  it('rejects when FileReader result is not a string', async () => {
    setMockFileReader({ result: new ArrayBuffer(8) })

    const blob = new Blob(['abc'], { type: 'image/png' })
    await expect(dataUrlService.blobToDataUrl(blob)).rejects.toThrow(
      'Failed to read file'
    )
  })

  it('rejects with reader error when reading fails', async () => {
    const readError = new DOMException('No read permission', 'NotReadableError')
    setMockFileReader({ triggerError: true, error: readError })

    const blob = new Blob(['abc'], { type: 'image/png' })
    await expect(dataUrlService.blobToDataUrl(blob)).rejects.toBe(readError)
  })

  it('fetches url and converts it to data url', async () => {
    setMockFileReader({ result: 'data:image/png;base64,fromFetch' })
    const blob = new Blob(['png'], { type: 'image/png' })

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(blob)
      })
    )

    await expect(
      dataUrlService.fetchUrlToDataUrl('http://localhost:8000/images/out.png')
    ).resolves.toBe('data:image/png;base64,fromFetch')
  })

  it('throws when fetch response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false
      })
    )

    await expect(
      dataUrlService.fetchUrlToDataUrl('http://localhost:8000/images/out.png')
    ).rejects.toThrow('Failed to load image')
  })
})
