import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

export default async function PartiesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = userData?.role

  // Only brokers can access this page
  if (role !== 'BROKER') {
    redirect('/dashboard')
  }

  // Get all deals created by this broker
  const { data: deals } = await supabase
    .from('deals')
    .select(`
      *,
      buyer:companies!buyer_id(*),
      seller:companies!seller_id(*)
    `)
    .eq('broker_id', user.id)

  // Aggregate companies data
  const buyersMap = new Map()
  const sellersMap = new Map()

  deals?.forEach((deal: any) => {
    // Process buyer
    if (deal.buyer) {
      const buyerId = deal.buyer.id
      if (!buyersMap.has(buyerId)) {
        buyersMap.set(buyerId, {
          ...deal.buyer,
          dealCount: 0,
          totalValue: 0,
          completedDeals: 0,
          verified: false, // Track if verified POF in any deal
        })
      }
      const buyer = buyersMap.get(buyerId)
      buyer.dealCount++
      buyer.totalValue += parseFloat(deal.estimated_value || 0)
      if (deal.status === 'COMPLETED') buyer.completedDeals++
      // If verified in any deal, mark as verified
      if (deal.buyer_verified) buyer.verified = true
    }

    // Process seller
    if (deal.seller) {
      const sellerId = deal.seller.id
      if (!sellersMap.has(sellerId)) {
        sellersMap.set(sellerId, {
          ...deal.seller,
          dealCount: 0,
          totalValue: 0,
          completedDeals: 0,
          verified: false, // Track if verified POP in any deal
        })
      }
      const seller = sellersMap.get(sellerId)
      seller.dealCount++
      seller.totalValue += parseFloat(deal.estimated_value || 0)
      if (deal.status === 'COMPLETED') seller.completedDeals++
      // If verified in any deal, mark as verified
      if (deal.seller_verified) seller.verified = true
    }
  })

  const buyers = Array.from(buyersMap.values())
  const sellers = Array.from(sellersMap.values())

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Parties</h1>

      {/* Buyers Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Buyers ({buyers.length})</CardTitle>
          <CardDescription>Companies buying from your network</CardDescription>
        </CardHeader>
        <CardContent>
          {buyers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Company Name</th>
                    <th className="text-left p-3 font-medium">Country</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-right p-3 font-medium">Deals</th>
                    <th className="text-right p-3 font-medium">Completed</th>
                    <th className="text-right p-3 font-medium">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((buyer: any) => (
                    <tr key={buyer.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {buyer.name}
                          {buyer.verified && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </td>
                      <td className="p-3">{buyer.country}</td>
                      <td className="p-3 text-sm">{buyer.company_type}</td>
                      <td className="p-3 text-right">{buyer.dealCount}</td>
                      <td className="p-3 text-right text-green-600">{buyer.completedDeals}</td>
                      <td className="p-3 text-right font-medium">${buyer.totalValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400 text-center py-8">
              No buyers in your network yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sellers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sellers ({sellers.length})</CardTitle>
          <CardDescription>Companies selling through your network</CardDescription>
        </CardHeader>
        <CardContent>
          {sellers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Company Name</th>
                    <th className="text-left p-3 font-medium">Country</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-right p-3 font-medium">Deals</th>
                    <th className="text-right p-3 font-medium">Completed</th>
                    <th className="text-right p-3 font-medium">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller: any) => (
                    <tr key={seller.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {seller.name}
                          {seller.verified && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </td>
                      <td className="p-3">{seller.country}</td>
                      <td className="p-3 text-sm">{seller.company_type}</td>
                      <td className="p-3 text-right">{seller.dealCount}</td>
                      <td className="p-3 text-right text-green-600">{seller.completedDeals}</td>
                      <td className="p-3 text-right font-medium">${seller.totalValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400 text-center py-8">
              No sellers in your network yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
