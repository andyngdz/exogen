import clsx from 'clsx'
import { FC } from 'react'

export interface GeneratorConfigStyleEmptyStateProps {
  query: string
}

export const GeneratorConfigStyleEmptyState: FC<
  GeneratorConfigStyleEmptyStateProps
> = ({ query }) => {
  return (
    <div
      className={clsx(
        'flex flex-col gap-4 items-center justify-center',
        'py-8 text-center'
      )}
    >
      <div className="text-lg font-medium text-foreground">
        No styles found matching &quot;{query}&quot;
      </div>
      <div className="text-sm text-muted">
        Try different keywords or browse all styles
      </div>
    </div>
  )
}
