import { ValueChanged } from '@/types'
import { find } from 'es-toolkit/compat'
import { useCallback, useState } from 'react'
import { isFileDropItem } from 'react-aria'
import type { DropZoneProps, FileDropItem } from 'react-aria-components'

interface UseImageDropzoneParams {
  onFile: ValueChanged<File, Promise<void>>
}

/** Tracks the drag-over state of a React Aria DropZone and hands the first dropped file to onFile. */
export const useImageDropzone = ({ onFile }: UseImageDropzoneParams) => {
  const [isDragActive, setIsDragActive] = useState(false)

  const onDropEnter = useCallback(() => {
    setIsDragActive(true)
  }, [])

  const onDropExit = useCallback(() => {
    setIsDragActive(false)
  }, [])

  const readDroppedFile = useCallback(
    async (fileItem: FileDropItem) => {
      await onFile(await fileItem.getFile())
    },
    [onFile]
  )

  const onDrop: NonNullable<DropZoneProps['onDrop']> = useCallback(
    (event) => {
      setIsDragActive(false)

      const fileItem = find(event.items, isFileDropItem)
      if (!fileItem) return

      void readDroppedFile(fileItem)
    },
    [readDroppedFile]
  )

  return { isDragActive, onDropEnter, onDropExit, onDrop }
}
