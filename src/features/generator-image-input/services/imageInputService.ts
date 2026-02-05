import { first, isEmpty } from 'es-toolkit/compat'
import { dataUrlService } from '@/services/data-url'

type ClipboardItemLike = Pick<DataTransferItem, 'type' | 'getAsFile'>

type ClipboardDataLike = {
  items?: ArrayLike<ClipboardItemLike> | null
}

export type ClipboardImageFileEvent = {
  clipboardData?: ClipboardDataLike | null
}

export class ImageInputService {
  async fileToDataUrl(file: File) {
    return dataUrlService.fileToDataUrl(file)
  }

  firstFile(files: ArrayLike<File>) {
    return first(files)
  }

  isImageFile(file: File) {
    return file.type.startsWith('image/')
  }

  clipboardImageFile(event: ClipboardImageFileEvent) {
    const items = event.clipboardData?.items
    if (!items || isEmpty(items)) return

    const imageItem = Array.from(items).find((item) =>
      item.type.startsWith('image/')
    )

    return imageItem?.getAsFile()
  }
}

export const imageInputService = new ImageInputService()
