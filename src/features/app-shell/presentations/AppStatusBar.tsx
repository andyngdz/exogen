import { useAppStatusBar } from '@/features/app-shell/states/useAppStatusBar'
import { StatusTone } from '@/features/app-shell/types'
import { ProgressBar } from '@heroui/react'
import clsx from 'clsx'

const TONE_CLASS_NAMES: Record<StatusTone, string> = {
  [StatusTone.SUCCESS]: 'text-success',
  [StatusTone.WARNING]: 'text-warning',
  [StatusTone.DANGER]: 'text-danger'
}

export const AppStatusBar = () => {
  const { backendStatus, gpuLabel, vramUsage, download } = useAppStatusBar()

  return (
    <footer
      className={clsx(
        'flex h-8 shrink-0 items-center justify-between',
        'border-t border-separator px-4 text-xs text-muted'
      )}
    >
      <div className="flex items-center gap-4">
        <span
          className={clsx(
            'flex items-center gap-2',
            TONE_CLASS_NAMES[backendStatus.tone]
          )}
        >
          <span aria-hidden className="size-1.5 rounded-full bg-current" />
          {backendStatus.label}
        </span>
        {gpuLabel && <span className="font-mono">{gpuLabel}</span>}
      </div>
      <div className="flex items-center gap-4">
        {download && (
          <span className="flex items-center gap-2">
            <span className="text-accent">Downloading {download.modelId}</span>
            <ProgressBar
              aria-label={`Downloading ${download.modelId}`}
              value={download.percent}
              size="sm"
              className="grid w-16 gap-0"
            >
              <ProgressBar.Track>
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
            <span className="font-mono">{download.label}</span>
          </span>
        )}
        {vramUsage && (
          <span className="flex items-center gap-2">
            <span>VRAM</span>
            <ProgressBar
              aria-label="VRAM in use"
              value={vramUsage.percent}
              size="sm"
              className="grid w-16 gap-0"
            >
              <ProgressBar.Track>
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
            <span className="font-mono">{vramUsage.label}</span>
          </span>
        )}
      </div>
    </footer>
  )
}
