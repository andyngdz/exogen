import { AuthorAvatar } from '@/cores/presentations/AuthorAvatar'
import { Button, Chip } from '@heroui/react'
import { map, split, take } from 'es-toolkit/compat'
import { Orbit } from 'lucide-react'
import { FC, useMemo, useState } from 'react'
import { ModelSearchViewHeader } from './ModelSearchViewHeader'

export interface ModelSearchViewSpacesProps {
  spaces: string[]
}

export const ModelSearchViewSpaces: FC<ModelSearchViewSpacesProps> = ({
  spaces
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const showMoreText = isExpanded ? 'Show less' : 'Show more'

  const showSpaces = useMemo(() => {
    if (isExpanded) {
      return spaces
    }
    return take(spaces, 5)
  }, [isExpanded, spaces])

  return (
    <div className="flex flex-col gap-6">
      <ModelSearchViewHeader Icon={Orbit} title="Spaces" />
      <div className="flex flex-wrap gap-2">
        {map(showSpaces, (space) => {
          return (
            <Chip variant="secondary" key={space}>
              <span className="flex items-center gap-2">
                <AuthorAvatar
                  id={split(space, '/')[0]}
                  size="sm"
                  className="size-5"
                />
                <Chip.Label>{space}</Chip.Label>
              </span>
            </Chip>
          )
        })}
        <Button
          onPress={() => setIsExpanded((prev) => !prev)}
          variant="outline"
          className="text-warning"
          size="sm"
        >
          {showMoreText}
        </Button>
      </div>
    </div>
  )
}
