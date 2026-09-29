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
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        isIconOnly
        size="sm"
        variant="tertiary"
        onPress={onDownload}
        aria-label="Download image"
      >
        <Download size={16} />
      </Button>
    </div>
  )
}
