import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, Clock, AlertCircle, FileText, Upload } from 'lucide-react'
import { DEAL_STEPS } from '@/lib/utils/constants'

export default async function StepDetailPage({
  params,
}: {
  params: { id: string; stepNumber: string }
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const stepNumber = parseInt(params.stepNumber)

  // Get deal details
  const { data: deal } = await supabase
    .from('deals')
    .select(`
      *,
      buyer:companies!buyer_id(name),
      seller:companies!seller_id(name),
      broker:users!broker_id(full_name)
    `)
    .eq('id', params.id)
    .single()

  if (!deal) {
    return <div className="p-8">Deal not found</div>
  }

  // Get step details
  const { data: step } = await supabase
    .from('deal_steps')
    .select('*')
    .eq('deal_id', params.id)
    .eq('step_number', stepNumber)
    .single()

  if (!step) {
    return <div className="p-8">Step not found</div>
  }

  // Get documents for this step
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('deal_id', params.id)
    .order('created_at', { ascending: false })

  const stepInfo = DEAL_STEPS.find(s => s.number === stepNumber)

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success'
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
        <Link href={`/dashboard/deals/${params.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deal
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Step {stepNumber}: {stepInfo?.name}</h1>
              <Badge variant={getStatusColor(step.status)}>
                {step.status}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {deal.deal_number} " {stepInfo?.phase}
            </p>
          </div>
          <div className="flex gap-2">
            {step.status === 'IN_PROGRESS' && (
              <Button>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            )}
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

          {/* Documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Documents</CardTitle>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
              <CardDescription>
                Documents related to this step
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{doc.filename}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {doc.zk_verified && (
                        <Badge variant="success" className="text-xs">
                           Verified
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No documents uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>

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
                {step.started_at && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" />
                    <div>
                      <p className="font-medium text-sm">Step Started</p>
                      <p className="text-xs text-slate-500">
                        {new Date(step.started_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {step.completed_at && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-600 mt-2" />
                    <div>
                      <p className="font-medium text-sm">Step Completed</p>
                      <p className="text-xs text-slate-500">
                        {new Date(step.completed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {step.status === 'PENDING' && (
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
                {getStatusIcon(step.status)}
                <div>
                  <p className="font-semibold">{step.status}</p>
                  <p className="text-sm text-slate-500">Current status</p>
                </div>
              </div>

              {step.started_at && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Started
                  </p>
                  <p className="font-medium text-sm">
                    {new Date(step.started_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              {step.completed_at && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Completed
                  </p>
                  <p className="font-medium text-sm">
                    {new Date(step.completed_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              {step.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Notes
                  </p>
                  <p className="text-sm">{step.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stepNumber > 1 && (
                <Link href={`/dashboard/deals/${params.id}/steps/${stepNumber - 1}`}>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    ê Previous Step
                  </Button>
                </Link>
              )}
              {stepNumber < 12 && (
                <Link href={`/dashboard/deals/${params.id}/steps/${stepNumber + 1}`}>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    Next Step í
                  </Button>
                </Link>
              )}
              <Link href={`/dashboard/deals/${params.id}`}>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  View All Steps
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
