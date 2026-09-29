import { FC } from 'react'
import { AuthorAvatar } from './AuthorAvatar'

export interface ModelWithAvatarProps {
  author: string
  id: string
}

export const ModelWithAvatar: FC<ModelWithAvatarProps> = ({ author, id }) => {
  return (
    <div className="flex items-center gap-2">
      <AuthorAvatar id={author} size="sm" alt={id} className="w-4 h-4" />
      <span className="text-left text-sm">{id}</span>
    </div>
  )
}
