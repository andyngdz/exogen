import clsx from 'clsx'
import { FC, PropsWithChildren } from 'react'

export interface InspectorSectionProps extends PropsWithChildren {
  title: string
}

/** One titled block of inspector controls, separated from the next by a hairline. */
export const InspectorSection: FC<InspectorSectionProps> = ({
  title,
  children
}) => {
  return (
    <section
      className={clsx(
        'flex flex-col gap-4 p-4',
        'border-b border-separator last:border-b-0'
      )}
    >
      <span className="text-xs font-medium text-muted">{title}</span>
      {children}
    </section>
  )
}
