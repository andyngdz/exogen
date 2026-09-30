import clsx from 'clsx'
import { FC, PropsWithChildren, ReactNode } from 'react'

export interface InspectorSectionProps extends PropsWithChildren {
  title: string
  titleAction?: ReactNode
}

/** One titled block of inspector controls, separated from the next by a hairline. */
export const InspectorSection: FC<InspectorSectionProps> = ({
  title,
  titleAction,
  children
}) => {
  return (
    <section
      className={clsx(
        'flex flex-col gap-4 p-4',
        'border-b border-separator last:border-b-0'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted">{title}</span>
        {titleAction}
      </div>
      {children}
    </section>
  )
}
