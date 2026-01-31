import { describe, expect, it } from 'vitest'

import { imageInputService } from '../imageInputService'

describe('imageInputService', () => {
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
    } as unknown as ClipboardEvent

    expect(imageInputService.clipboardImageFile(event)).toBe(file)
  })
})
