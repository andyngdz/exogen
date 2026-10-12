'use client'

import { useManageDownloadedModel } from '@/features/model-search/states/useManageDownloadedModel'
import { Button } from '@heroui/react'

export const ModelSearchViewDownloadedButton = () => {
  const { onManageModel } = useManageDownloadedModel()

  return (
    <Button variant="outline" onPress={onManageModel}>
      Manage this model
    </Button>
  )
}
