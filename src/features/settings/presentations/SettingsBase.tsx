import { Divider } from '@heroui/react'
import { FC, PropsWithChildren } from 'react'

export interface SettingsBaseProps {
  title: string
  description: string
}

export const SettingsBase: FC<PropsWithChildren<SettingsBaseProps>> = ({
  title,
  description,
  children
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-default-500">{description}</p>
      </div>
      <Divider />
      {children}
    </div>
  )
}
