import clsx from 'clsx'

export const ImageInputPlaceholder = () => {
  return (
    <div
      className={clsx(
        'h-full w-full flex flex-col gap-2',
        'items-center justify-center',
        'px-6 text-center text-sm text-muted'
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="text-muted">Click to upload</div>
        <div>or drop an image</div>
      </div>
      <div className="text-xs text-muted">
        Tip: paste from clipboard (Ctrl/Cmd+V)
      </div>
    </div>
  )
}
