'use client'

import { useRouter } from 'next/navigation'
import WorkflowTracker from './workflow-tracker'

interface WorkflowTrackerWrapperProps {
  currentStep: number
  dealId: string
}

export default function WorkflowTrackerWrapper({ currentStep, dealId }: WorkflowTrackerWrapperProps) {
  const router = useRouter()

  const handleStepClick = (stepNumber: number) => {
    router.push(`/dashboard/deals/${dealId}/steps/${stepNumber}`)
  }

  return <WorkflowTracker currentStep={currentStep} onStepClick={handleStepClick} />
}
