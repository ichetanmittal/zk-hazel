'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DEAL_STEPS } from '@/lib/utils/constants'
import { Check, Circle, Lock } from 'lucide-react'

interface WorkflowTrackerProps {
  currentStep: number
  onStepClick?: (step: number) => void
}

export default function WorkflowTracker({ currentStep, onStepClick }: WorkflowTrackerProps) {
  const getStepIcon = (stepNumber: number) => {
    if (stepNumber < currentStep) {
      return <Check className="w-5 h-5 text-green-600" />
    } else if (stepNumber === currentStep) {
      return <Circle className="w-5 h-5 text-blue-600 fill-blue-600" />
    } else {
      return <Lock className="w-5 h-5 text-slate-400" />
    }
  }

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed'
    if (stepNumber === currentStep) return 'current'
    return 'pending'
  }

  const groupedSteps = {
    'PRE-TRADE': DEAL_STEPS.filter(s => s.phase === 'PRE-TRADE'),
    'AGREEMENT': DEAL_STEPS.filter(s => s.phase === 'AGREEMENT'),
    'VERIFICATION': DEAL_STEPS.filter(s => s.phase === 'VERIFICATION'),
    'SETTLEMENT': DEAL_STEPS.filter(s => s.phase === 'SETTLEMENT'),
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedSteps).map(([phase, steps]) => (
        <div key={phase}>
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
            {phase}
          </h3>
          <div className="space-y-2">
            {steps.map((step) => {
              const status = getStepStatus(step.number)
              return (
                <button
                  key={step.number}
                  onClick={() => onStepClick?.(step.number)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    status === 'completed'
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                      : status === 'current'
                      ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  } hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStepIcon(step.number)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-500">
                          Step {step.number}
                        </span>
                        {status === 'current' && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                        {status === 'completed' && (
                          <Badge variant="success" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-sm mb-1">{step.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
