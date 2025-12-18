'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'

interface CompleteStepButtonProps {
  dealId: string
  stepNumber: number
  stepName: string
}

export default function CompleteStepButton({
  dealId,
  stepNumber,
  stepName,
}: CompleteStepButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleComplete = async () => {
    if (!confirm(`Are you sure you want to mark "${stepName}" as complete?`)) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `/api/deals/${dealId}/steps/${stepNumber}/complete`,
        {
          method: 'POST',
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete step')
      }

      // Refresh the page to show updated status
      router.refresh()

      // Optionally redirect to deal page
      setTimeout(() => {
        router.push(`/dashboard/deals/${dealId}`)
      }, 1000)
    } catch (err: any) {
      console.error('Complete step error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-2 text-sm text-red-600">{error}</div>
      )}
      <Button onClick={handleComplete} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Completing...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Complete
          </>
        )}
      </Button>
    </div>
  )
}
