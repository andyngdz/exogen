import clsx from 'clsx'
import { FC } from 'react'

interface UpdatePendingDotProps {
  className?: string
}

/** The accent dot that flags a downloaded update; screen readers hear "Update ready". */
export const UpdatePendingDot: FC<UpdatePendingDotProps> = ({ className }) => {
  return (
    <span className={clsx('size-2 shrink-0 rounded-full bg-accent', className)}>
      <span className="sr-only">Update ready</span>
    </span>
  )
}
