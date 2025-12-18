import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import WorkflowTrackerWrapper from '@/components/deals/workflow-tracker-wrapper'
import { ArrowLeft, FileText } from 'lucide-react'

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success'
      case 'MATCHED':
      case 'IN_PROGRESS':
        return 'default'
      case 'PENDING_VERIFICATION':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/deals">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Deals
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{deal.deal_number}</h1>
              <Badge variant={getStatusColor(deal.status)}>
                {deal.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {deal.quantity.toLocaleString()} {deal.quantity_unit} {deal.product_type.replace('_', ' ')} — {deal.location}
            </p>
            <p className="text-slate-500">
              ${deal.estimated_value.toLocaleString()} • {deal.delivery_terms}
            </p>
          </div>
          <Link href={`/dashboard/data-room?deal=${deal.id}`}>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Data Room
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Workflow */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>12-Step Trading Workflow</CardTitle>
              <CardDescription>
                Track progress through the standardized commodity trading process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowTrackerWrapper currentStep={deal.current_step || 1} dealId={deal.id} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Deal Info */}
        <div className="space-y-6">
          {/* Parties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Buyer
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {deal.buyer?.name || 'Pending invitation'}
                  </p>
                  {deal.buyer_verified && (
                    <Badge variant="success" className="text-xs">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Seller
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {deal.seller?.name || 'Pending invitation'}
                  </p>
                  {deal.seller_verified && (
                    <Badge variant="success" className="text-xs">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Broker
                </p>
                <p className="font-semibold">{deal.broker?.full_name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Deal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400">Created</p>
                <p className="font-medium">
                  {new Date(deal.created_at).toLocaleDateString()}
                </p>
              </div>
              {deal.matched_at && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Matched</p>
                  <p className="font-medium">
                    {new Date(deal.matched_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-slate-600 dark:text-slate-400">Progress</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Step {deal.current_step}/12</p>
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${(deal.current_step / 12) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {deal.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {deal.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
