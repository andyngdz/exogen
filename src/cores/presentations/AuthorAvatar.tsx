'use client'

import { useBackendUrl } from '@/cores/backend-initialization'
import { Avatar, AvatarProps } from '@heroui/react'
import { first } from 'es-toolkit/compat'
import { FC } from 'react'

export interface AuthorAvatarProps extends Pick<
  AvatarProps,
  'size' | 'className'
> {
  id: string
  alt?: string
}

export const AuthorAvatar: FC<AuthorAvatarProps> = ({ id, alt, ...props }) => {
  const baseURL = useBackendUrl()

  return (
    <Avatar {...props}>
      <Avatar.Image src={`${baseURL}/users/avatar/${id}.png`} alt={alt ?? id} />
      <Avatar.Fallback>{first(id)}</Avatar.Fallback>
    </Avatar>
  )
}
