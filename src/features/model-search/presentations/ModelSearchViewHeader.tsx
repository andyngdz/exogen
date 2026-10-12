import { Link } from '@heroui/react'
import { buttonVariants } from '@heroui/styles'
import { LinkIcon, LucideProps } from 'lucide-react'
import { ComponentType, FC } from 'react'

export interface ModelSearchViewHeaderProps {
  Icon: ComponentType<LucideProps>
  title: string
  href?: string
}

export const ModelSearchViewHeader: FC<ModelSearchViewHeaderProps> = ({
  Icon,
  title,
  href
}) => {
  return (
    <div className="flex gap-2">
      <div className="flex items-center gap-2">
        <Icon className="text-accent" />
        <span className="text-foreground font-bold">{title}</span>
      </div>
      {href && (
        <Link
          href={href}
          target="_blank"
          aria-label={`Open ${title} on Hugging Face`}
          className={buttonVariants({
            variant: 'ghost',
            size: 'sm',
            isIconOnly: true
          })}
        >
          <LinkIcon size={16} />
        </Link>
      )}
    </div>
  )
}
