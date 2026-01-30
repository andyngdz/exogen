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
  )
}
