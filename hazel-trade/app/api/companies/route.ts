import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // 'buyer' or 'seller'

    // Get all companies that this broker has worked with
    let query = supabase
      .from('deals')
      .select(`
        buyer:companies!buyer_id(id, name, country, company_type),
        seller:companies!seller_id(id, name, country, company_type)
      `)
      .eq('broker_id', user.id)

    const { data: deals, error } = await query

    if (error) throw error

    // Extract unique companies
    const companiesMap = new Map()

    deals?.forEach((deal: any) => {
      if (role === 'buyer' && deal.buyer) {
        companiesMap.set(deal.buyer.id, deal.buyer)
      } else if (role === 'seller' && deal.seller) {
        companiesMap.set(deal.seller.id, deal.seller)
      } else if (!role) {
        // If no role specified, return both
        if (deal.buyer) companiesMap.set(deal.buyer.id, deal.buyer)
        if (deal.seller) companiesMap.set(deal.seller.id, deal.seller)
      }
    })

    const companies = Array.from(companiesMap.values())

    return NextResponse.json({ companies })
  } catch (error: any) {
    console.error('Companies fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
