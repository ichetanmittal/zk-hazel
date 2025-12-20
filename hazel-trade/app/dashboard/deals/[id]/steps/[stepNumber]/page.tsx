import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, Clock, AlertCircle, FileText, Upload } from 'lucide-react'
import { DEAL_STEPS } from '@/lib/utils/constants'
import StepDocumentUpload from '@/components/deals/step-document-upload'

export default async function StepDetailPage({
  params,
}: {
  params: Promise<{ id: string; stepNumber: string }>
}) {
  const { id, stepNumber: stepNumberStr } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const stepNumber = parseInt(stepNumberStr)

  // Get deal details
  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .select(`
      *,
      buyer:companies!buyer_id(name),
      seller:companies!seller_id(name),
      broker:users!broker_id(full_name)
    `)
    .eq('id', id)
    .single()

  if (dealError || !deal) {
    return <div className="p-8">Deal not found</div>
  }

  const currentDeal: any = deal

  // Get step details
  const { data: step, error: stepError } = await supabase
    .from('deal_steps')
    .select('*')
    .eq('deal_id', id)
    .eq('step_number', stepNumber)
    .single()

  if (stepError || !step) {
    return <div className="p-8">Step not found</div>
  }

  const currentStep: any = step

  // Get user role
  const { data: userData } = await supabase
    .from('users')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  const userRole = (userData as any)?.role

  // Get party approvals for this step
  const { data: partyApprovals } = await supabase
    .from('step_party_approvals')
    .select('*')
    .eq('deal_id', id)
    .eq('step_number', stepNumber)

  // ACCESS CONTROL: Check if step is accessible
  // Steps are only accessible after deal is MATCHED
  if (currentDeal.status === 'PENDING_VERIFICATION' || currentDeal.status === 'DRAFT') {
    return (
      <div className="p-8">
        <Link href={`/dashboard/deals/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deal
          </Button>
        </Link>
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-2">
                  Workflow Locked - Verification Required
                </h2>
                <p className="text-orange-800 dark:text-orange-200 mb-4">
                  The 12-step trading workflow will unlock after both buyer and seller complete verification (POF/POP upload).
                </p>
                <div className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
                  <div className="flex items-center gap-2">
                    {currentDeal.buyer_verified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span>Buyer Verification (POF): {currentDeal.buyer_verified ? 'Complete' : 'Pending'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentDeal.seller_verified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span>Seller Verification (POP): {currentDeal.seller_verified ? 'Complete' : 'Pending'}</span>
                  </div>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-4">
                  Once both parties verify, Step 1 (NCNDA/IMFPA) will automatically activate and the workflow will begin.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ACCESS CONTROL: Check if this specific step is accessible
  // Users can only access steps that are IN_PROGRESS, COMPLETED, or the current step
  const isStepAccessible =
    currentStep.status === 'IN_PROGRESS' ||
    currentStep.status === 'COMPLETED' ||
    stepNumber <= currentDeal.current_step

  if (!isStepAccessible) {
    return (
      <div className="p-8">
        <Link href={`/dashboard/deals/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deal
          </Button>
        </Link>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-slate-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold mb-2">Step Not Yet Available</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  This step is locked. Complete the previous steps in the workflow to unlock Step {stepNumber}.
                </p>
                <p className="text-sm text-slate-500">
                  Current Step: <strong>Step {currentDeal.current_step}</strong>
                </p>
                <Link href={`/dashboard/deals/${id}/steps/${currentDeal.current_step}`}>
                  <Button className="mt-4">
                    Go to Current Step
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get documents for this step
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('deal_id', id)
    .order('created_at', { ascending: false })

  const stepDocuments: any[] = documents || []

  const stepInfo: any = DEAL_STEPS.find(s => s.number === stepNumber)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="w-6 h-6 text-blue-600" />
      case 'PENDING':
        return <Clock className="w-6 h-6 text-slate-400" />
      case 'BLOCKED':
        return <AlertCircle className="w-6 h-6 text-red-600" />
      default:
        return <Clock className="w-6 h-6 text-slate-400" />
    }
  }

  const getStatusColor = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (status) {
      case 'COMPLETED':
      case 'IN_PROGRESS':
        return 'default'
      case 'BLOCKED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/dashboard/deals/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deal
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Step {stepNumber}: {stepInfo?.name}</h1>
              <Badge variant={getStatusColor(currentStep.status)}>
                {currentStep.status}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {currentDeal.deal_number} " {stepInfo?.phase}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step Info */}
          <Card>
            <CardHeader>
              <CardTitle>Step Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {stepInfo?.description}
                </p>
              </div>

              {stepInfo?.requirements && stepInfo.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="space-y-2">
                    {stepInfo.requirements.map((req: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {stepInfo?.documents && stepInfo.documents.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Required Documents</h3>
                  <div className="space-y-2">
                    {stepInfo.documents.map((doc: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-600" />
                          <span className="text-sm">{doc}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <StepDocumentUpload
            dealId={id}
            stepNumber={stepNumber}
            documents={stepDocuments}
            requiredParties={stepInfo?.requiredParties || []}
            partyApprovals={partyApprovals || []}
            currentUserRole={userRole}
          />

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Timeline of actions for this step
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentStep.started_at && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" />
                    <div>
                      <p className="font-medium text-sm">Step Started</p>
                      <p className="text-xs text-slate-500">
                        {new Date(currentStep.started_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {currentStep.completed_at && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-600 mt-2" />
                    <div>
                      <p className="font-medium text-sm">Step Completed</p>
                      <p className="text-xs text-slate-500">
                        {new Date(currentStep.completed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {currentStep.status === 'PENDING' && (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500">No activity yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(currentStep.status)}
                <div>
                  <p className="font-semibold">{currentStep.status}</p>
                  <p className="text-sm text-slate-500">Current status</p>
                </div>
              </div>

              {currentStep.started_at && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Started
                  </p>
                  <p className="font-medium text-sm">
                    {new Date(currentStep.started_at).toISOString().split('T')[0]}
                  </p>
                </div>
              )}

              {currentStep.completed_at && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Completed
                  </p>
                  <p className="font-medium text-sm">
                    {new Date(currentStep.completed_at).toISOString().split('T')[0]}
                  </p>
                </div>
              )}

              {currentStep.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Notes
                  </p>
                  <p className="text-sm">{currentStep.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
