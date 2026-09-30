import { Button } from '@heroui/react'
import clsx from 'clsx'
import { Box, Search, Sparkles } from 'lucide-react'
import { FC } from 'react'

interface ModelsEmptyViewProps {
  onSeeRecommended: VoidFunction
  onSearchHuggingFace: VoidFunction
}

/** No models installed yet, per frame 3k. */
export const ModelsEmptyView: FC<ModelsEmptyViewProps> = ({
  onSeeRecommended,
  onSearchHuggingFace
}) => {
  return (
    <div
      className={clsx(
        'flex flex-1 flex-col items-center justify-center gap-4',
        'pb-16 text-center'
      )}
    >
      <span
        className={clsx(
          'flex size-12 items-center justify-center',
          'rounded-2xl bg-surface text-muted'
        )}
      >
        <Box size={22} />
      </span>
      <div className="flex max-w-sm flex-col gap-2">
        <h2 className="text-base font-semibold">No models installed</h2>
        <p className="text-sm text-muted">
          Generating needs at least one model. Pick one sized for your GPU, or
          search Hugging Face.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="primary" onPress={onSeeRecommended}>
          <Sparkles size={16} />
          See recommended
        </Button>
        <Button variant="secondary" onPress={onSearchHuggingFace}>
          <Search size={16} />
          Search Hugging Face
        </Button>
      </div>
    </div>
  )
}
