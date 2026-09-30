import { StagePanelTone } from '@/features/generator-stage/types'
import clsx from 'clsx'
import { FC, ReactNode } from 'react'

interface GeneratorStagePanelProps {
  icon: ReactNode
  tone: StagePanelTone
  title: string
  description: ReactNode
  children?: ReactNode
}

/** The 440px card every non-result stage state renders in. */
export const GeneratorStagePanel: FC<GeneratorStagePanelProps> = ({
  icon,
  tone,
  title,
  description,
  children
}) => {
  return (
    <section
      aria-label={title}
      className={clsx(
        'flex w-110 max-w-full flex-col gap-4 p-8',
        'rounded-3xl bg-surface shadow-surface'
      )}
    >
      <span
        className={clsx('flex size-9 items-center justify-center rounded-xl', {
          'bg-accent-soft text-accent-soft-foreground':
            tone === StagePanelTone.ACCENT,
          'bg-danger-soft text-danger-soft-foreground':
            tone === StagePanelTone.DANGER
        })}
      >
        {icon}
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </div>
      {children}
    </section>
  )
}
