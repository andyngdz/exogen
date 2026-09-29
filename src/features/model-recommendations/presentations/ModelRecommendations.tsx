'use client'

import { useModelRecommendation } from '@/features/model-recommendations/states/useModelRecommendation'
import { SetupLayout } from '@/features/setup-layout'
import { Button } from '@heroui/react'
import { ModelRecommendationsList } from './ModelRecommendationsList'

export const ModelRecommendations = () => {
  const { onNext, onSkip, onBack, isDownloading, data } =
    useModelRecommendation()

  return (
    <SetupLayout
      title="Model Recommendations"
      description="Choose an AI model that fits your hardware capabilities and performance needs"
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={isDownloading}
      isBackDisabled={isDownloading}
    >
      <div className="flex flex-col items-center gap-6">
        {data && (
          <ModelRecommendationsList
            sections={data.sections}
            defaultSection={data.default_section}
          />
        )}
        {!isDownloading && (
          <Button
            onPress={onSkip}
            variant="ghost"
            className="text-accent"
            size="sm"
          >
            Skip for now, I will download later
          </Button>
        )}
      </div>
    </SetupLayout>
  )
}
