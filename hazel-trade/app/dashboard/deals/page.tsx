import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

export default async function DealsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user details
  const { data: userData } = await supabase
    .from('users')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  const currentUser: any = userData
  const role = currentUser?.role

  // Get deals based on role
  let dealsQuery = supabase
    .from('deals')
    .select('*, buyer:companies!buyer_id(name), seller:companies!seller_id(name), broker:users!broker_id(full_name)')

  if (role === 'BROKER') {
    dealsQuery = dealsQuery.eq('broker_id', user.id)
  } else if (role === 'BUYER') {
    dealsQuery = dealsQuery.eq('buyer_id', userData.company_id)
  } else if (role === 'SELLER') {
    dealsQuery = dealsQuery.eq('seller_id', userData.company_id)
  }

  const { data: deals } = await dealsQuery.order('created_at', { ascending: false })

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Deals</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {deals?.length || 0} total deals
          </p>
        </div>
        {role === 'BROKER' && (
          <Link href="/dashboard/deals/new">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </Link>
        )}
      </div>

      {deals && deals.length > 0 ? (
        <div className="grid gap-4">
          {deals.map((deal) => (
            <Link key={deal.id} href={`/dashboard/deals/${deal.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{deal.deal_number}</h3>
                        <Badge variant={getStatusColor(deal.status)}>
                          {deal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-2">
                        {deal.quantity.toLocaleString()} {deal.quantity_unit} {deal.product_type.replace('_', ' ')} • {deal.location}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>${deal.estimated_value.toLocaleString()}</span>
                        <span>•</span>
                        <span>{deal.delivery_terms}</span>
                        <span>•</span>
                        <span>Step {deal.current_step}/12</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col gap-2 items-end mb-2">
                        {deal.buyer_verified && (
                          <Badge variant="success" className="text-xs">
                            ✓ Buyer Verified
                          </Badge>
                        )}
                        {deal.seller_verified && (
                          <Badge variant="success" className="text-xs">
                            ✓ Seller Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Created {new Date(deal.created_at).toISOString().split('T')[0]}
                      </p>
                    </div>
                  </div>
                  {deal.notes && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t">
                      {deal.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              No deals yet
            </p>
            {role === 'BROKER' && (
              <Link href="/dashboard/deals/new">
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Your First Deal
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
