import clsx from 'clsx'
import NothingHereYet from '@/assets/planet.png'
import NextImage from 'next/image'

export const HistoryEmpty = () => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-2',
        'h-96 p-4'
      )}
    >
      <NextImage
        src={NothingHereYet}
        alt="Nothing here yet"
        width={96}
        height={96}
      />
      <div className="font-semibold">No histories found</div>
      <div className="text-foreground text-sm text-center">
        Generate new images and your history will appear here
      </div>
    </div>
  )
}
