import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user details
  const { data: userData } = await supabase
    .from('users')
    .select('*, companies(*)')
    .eq('id', user.id)
    .single()

  const role = userData?.role

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

  const { data: deals } = await dealsQuery.limit(5).order('created_at', { ascending: false })

  // Stats
  const activeDeals = deals?.filter(d => d.status === 'IN_PROGRESS' || d.status === 'MATCHED').length || 0
  const pendingVerification = deals?.filter(d => d.status === 'PENDING_VERIFICATION').length || 0
  const completedDeals = deals?.filter(d => d.status === 'COMPLETED').length || 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {userData?.full_name}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {role === 'BROKER' && 'Manage your deals and track progress'}
          {role === 'BUYER' && 'Track your purchases and verification status'}
          {role === 'SELLER' && 'Manage your sales and inventory'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDeals}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Verification
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingVerification}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Awaiting ZK verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Deals</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedDeals}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Successfully closed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Deals</CardTitle>
              <CardDescription>
                {role === 'BROKER' ? 'Deals you created' : 'Your active deals'}
              </CardDescription>
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
        </CardHeader>
        <CardContent>
          {deals && deals.length > 0 ? (
            <div className="space-y-4">
              {deals.map((deal) => (
                <Link key={deal.id} href={`/dashboard/deals/${deal.id}`}>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold">{deal.deal_number}</p>
                        <Badge
                          variant={
                            deal.status === 'COMPLETED'
                              ? 'success'
                              : deal.status === 'MATCHED'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {deal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {deal.quantity} {deal.quantity_unit} {deal.product_type.replace('_', ' ')} • {deal.location}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        ${deal.estimated_value.toLocaleString()} • Step {deal.current_step}/12
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2 items-center">
                        {deal.buyer_verified && <span className="text-xs text-green-600">✓ Buyer</span>}
                        {deal.seller_verified && <span className="text-xs text-green-600">✓ Seller</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
