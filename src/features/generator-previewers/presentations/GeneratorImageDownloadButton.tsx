import { Button } from '@heroui/react'
import { Download } from 'lucide-react'
import { FC } from 'react'

interface GeneratorImageDownloadButtonProps {
  onDownload: VoidFunction
}

export const GeneratorImageDownloadButton: FC<
  GeneratorImageDownloadButtonProps
> = ({ onDownload }) => {
  return (
    <div
      onClick={(event) => {
        event.stopPropagation()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.stopPropagation()
        }
      }}
    >
      <Button
        isIconOnly
        size="sm"
        variant="solid"
        color="default"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onPress={onDownload}
        aria-label="Download image"
      >
        <Download size={16} />
      </Button>
    </div>
  )
}
