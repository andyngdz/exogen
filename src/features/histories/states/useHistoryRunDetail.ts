import { useLorasQuery, useSamplersQuery } from '@/cores/api-queries'
import { useStyleSections } from '@/cores/hooks/useStyleSections'
import { useBackendUrl } from '@/cores/backend-initialization'
import { APP_SHELL_ACTIONS } from '@/features/app-shell/states/useAppShellStore'
import { AppView } from '@/features/app-shell/types'
import { useDownloadImages } from '@/features/generator-previewers/states/useDownloadImages'
import { historyViewService } from '@/features/histories/services/history-view'
import { HistoryItem } from '@/types'
import { find, map } from 'es-toolkit/compat'
import { useState } from 'react'
import { useUseConfig } from './useUseConfig'

/** The selected run's images, config rows and actions. */
export const useHistoryRunDetail = (history: HistoryItem) => {
  const baseURL = useBackendUrl()
  const { data: samplers } = useSamplersQuery()
  const { data: loras } = useLorasQuery()
  const { styleItems } = useStyleSections()
  const { onDownloadImage } = useDownloadImages()
  const { onUseConfig } = useUseConfig(history)
  const [pickedIndex, setPickedIndex] = useState(0)

  const images = history.generated_images
  const total = images.length
  const imageIndex = Math.min(pickedIndex, Math.max(0, total - 1))
  const image = images.at(imageIndex)
  const samplerName =
    find(samplers, { value: history.config.sampler })?.name ??
    history.config.sampler

  const step = (offset: number) =>
    setPickedIndex((imageIndex + offset + total) % total)

  return {
    ...(image && { imageUrl: `${baseURL}/${image.path}` }),
    positionLabel: `${imageIndex + 1} / ${total}`,
    canStep: total > 1,
    configRows: historyViewService.toConfigRows(history, {
      samplerName,
      styleNames: map(
        history.config.styles,
        (styleId) => find(styleItems, { id: styleId })?.name ?? styleId
      ),
      loraLabels: map(history.config.loras, (lora) => {
        const name =
          find(loras, { id: lora.lora_id })?.name ?? `#${lora.lora_id}`
        return `${name} ${lora.weight}`
      })
    }),
    onPrevious: () => step(-1),
    onNext: () => step(1),
    onDownload: () => {
      if (image) void onDownloadImage(`${baseURL}/${image.path}`)
    },
    onUseConfig: () => {
      onUseConfig()
      APP_SHELL_ACTIONS.setView(AppView.GENERATE)
    }
  }
}
