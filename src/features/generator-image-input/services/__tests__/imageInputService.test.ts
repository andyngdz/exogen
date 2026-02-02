import { afterEach, describe, expect, it, vi } from 'vitest'

import { imageInputService } from '../imageInputService'

describe('imageInputService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })
  it('returns the first file', () => {
    const file1 = new File(['a'], 'a.png', { type: 'image/png' })
    const file2 = new File(['b'], 'b.png', { type: 'image/png' })

    expect(imageInputService.firstFile([file1, file2])).toBe(file1)
  })

  it('detects image files by MIME type', () => {
    const img = new File(['a'], 'a.png', { type: 'image/png' })
    const txt = new File(['a'], 'a.txt', { type: 'text/plain' })

    expect(imageInputService.isImageFile(img)).toBe(true)
    expect(imageInputService.isImageFile(txt)).toBe(false)
  })

  it('extracts image file from clipboard items', () => {
    const file = new File(['a'], 'a.png', { type: 'image/png' })

    const event = {
      clipboardData: {
        items: [
          {
            type: 'text/plain',
            getAsFile: () => null
          },
          {
            type: 'image/png',
            getAsFile: () => file
          }
        ]
      }
    }

    expect(imageInputService.clipboardImageFile(event)).toBe(file)
  })

  it('rejects with fallback error when FileReader error is null', async () => {
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(
      function (this: FileReader) {
        Object.defineProperty(this, 'error', {
          value: null,
          configurable: true
        })

        this.dispatchEvent(new ProgressEvent('error'))
      }
    )

    const file = new File(['a'], 'a.png', { type: 'image/png' })
    await expect(imageInputService.fileToDataUrl(file)).rejects.toThrow(
      'Failed to read file'
    )
  })
})
