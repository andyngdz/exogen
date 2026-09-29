import { FC, PropsWithChildren } from 'react'

export interface SetupLayoutContentProps {
  title: string
  description: string
}

export const SetupLayoutContent: FC<
  PropsWithChildren<SetupLayoutContentProps>
> = ({ title, description, children }) => {
  return (
    <div className="max-w-4xl flex flex-1 items-center justify-center">
      <div className="mx-auto flex flex-col gap-12">
        <div className="flex flex-col gap-2 items-center justify-center">
          <h1 className="text-4xl font-bold text-base-content">{title}</h1>
          <span className="text-foreground">{description}</span>
        </div>
        <div className="flex flex-1 justify-center">
          <div className="container">{children}</div>
        </div>
      </div>
    </div>
  )
}
