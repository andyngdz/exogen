'use client'

import { useModelStep } from '@/features/model-recommendations/states/useModelStep'
import { OnboardingLayout } from '@/features/setup-layout/presentations/OnboardingLayout'
import { OnboardingStep, OnboardingWidth } from '@/features/setup-layout/types'
import {
  Button,
  RadioGroup,
  Spinner,
  ToggleButton,
  ToggleButtonGroup
} from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { ChevronLeft } from 'lucide-react'
import { ModelStepCard } from './ModelStepCard'
import { ModelStepDownloadButton } from './ModelStepDownloadButton'

/** Onboarding step 3, per frame 2g: pick a recommended model and download it. */
export const ModelRecommendations = () => {
  const step = useModelStep()

  return (
    <OnboardingLayout
      step={OnboardingStep.MODEL}
      width={OnboardingWidth.WIDE}
      title="Pick a starting model"
      description="Choose an AI model that fits your hardware and the kind of images you want."
      footer={
        <>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              isDisabled={step.isDownloading}
              onPress={step.onBack}
            >
              <ChevronLeft size={16} />
              Back
            </Button>
            <Button
              variant="ghost"
              isDisabled={step.isDownloading}
              onPress={step.onSkip}
            >
              Skip for now
            </Button>
          </div>
          {step.model && <ModelStepDownloadButton model={step.model} />}
        </>
      }
    >
      {step.isLoading && <Spinner aria-label="Loading recommendations" />}
      {step.hasManySections && step.sectionId && (
        <ToggleButtonGroup
          aria-label="Recommendation group"
          size="sm"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[step.sectionId]}
          onSelectionChange={step.onSectionChange}
        >
          {map(step.sectionOptions, (option) => (
            <ToggleButton key={option.id} id={option.id}>
              {option.name}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}
      {step.model && (
        <RadioGroup
          aria-label="Model"
          value={step.model.id}
          onChange={step.onModelChange}
          isDisabled={step.isDownloading}
          orientation="horizontal"
        >
          {map(step.models, (model) => (
            <ModelStepCard key={model.id} model={model} />
          ))}
        </RadioGroup>
      )}
      {step.hasNoModels && (
        <p className="text-sm text-muted">No models in this group yet.</p>
      )}
      <p className="text-xs text-muted">
        You can add more models from Hugging Face at any time in Models.
      </p>
    </OnboardingLayout>
  )
}
