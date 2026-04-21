class DataUrlService {
  async blobToDataUrl(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('Failed to read file'))
          return
        }

        resolve(reader.result)
      }

      reader.onerror = () => {
        reject(reader.error ?? new Error('Failed to read file'))
      }

      reader.readAsDataURL(blob)
    })
  }

  async fileToDataUrl(file: File) {
    return this.blobToDataUrl(file)
  }

  async fetchUrlToDataUrl(url: string) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to load image')
    }

    const blob = await response.blob()
    return this.blobToDataUrl(blob)
  }
}

export const dataUrlService = new DataUrlService()
