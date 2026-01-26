import { first, isEmpty } from 'es-toolkit/compat'

export class ImageInputService {
  async fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('Failed to read file'))
          return
        }

        resolve(reader.result)
      }

      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  firstFile(files: ArrayLike<File>) {
    return first(files)
  }

  isImageFile(file: File) {
    return file.type.startsWith('image/')
  }

  clipboardImageFile(event: ClipboardEvent) {
    const items = event.clipboardData?.items
    if (!items || isEmpty(items)) return

    const imageItem = Array.from(items).find((item) =>
      item.type.startsWith('image/')
    )

    return imageItem?.getAsFile()
  }
}

export const imageInputService = new ImageInputService()
