export type FileListLike = {
  readonly length: number
  item: (index: number) => File | null
  [index: number]: File
}

export const createFileListLike = (files: readonly File[]): FileListLike => {
  const list: {
    length: number
    item: (index: number) => File | null
    [index: number]: File
  } = {
    length: files.length,
    item: (index) => files[index] ?? null
  }

  files.forEach((file, index) => {
    list[index] = file
  })

  return list
}
