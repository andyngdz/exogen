import { toast } from '@heroui/react'

export const useDownloadImages = () => {
  const onDownloadImage = async (url: string) => {
    try {
      await globalThis.window.electronAPI.downloadImage(url)
    } catch (error) {
      const description =
        error instanceof Error ? error.message : 'Unknown error occurred'

      toast.warning('Failed to download image', { description })
    }
  }

  return { onDownloadImage }
}
