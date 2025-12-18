import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEAL_STEPS } from '@/lib/utils/constants'
import { sendInviteEmail } from '@/lib/email/send'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      dealData,
      buyerData,
      sellerData,
      commissionData,
    } = body

    // Generate deal number
    const year = new Date().getFullYear()
    const { count } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })

    const dealNumber = `HT-${year}-${String((count || 0) + 1).padStart(4, '0')}`

    // Create deal
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .insert({
        deal_number: dealNumber,
        ...dealData,
        broker_id: user.id,
        status: 'DRAFT',
        current_step: 1,
      })
      .select()
      .single()

    if (dealError || !deal) {
      throw dealError || new Error('Failed to create deal')
    }

    // Create deal steps
    const stepsToCreate = DEAL_STEPS.map(step => ({
      deal_id: deal.id,
      step_number: step.number,
      step_name: step.name,
      status: 'PENDING',
    }))

    const { error: stepsError } = await supabase
      .from('deal_steps')
      .insert(stepsToCreate)

    if (stepsError) throw stepsError

    // Create buyer invite
    const buyerToken = crypto.randomUUID()
    const { error: buyerInviteError } = await supabase
      .from('invites')
      .insert({
        deal_id: deal.id,
        email: buyerData.email,
        company_name: buyerData.company,
        role: 'BUYER',
        invited_by: user.id,
        token: buyerToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })

    if (buyerInviteError) throw buyerInviteError

    // Create seller invite
    const sellerToken = crypto.randomUUID()
    const { error: sellerInviteError } = await supabase
      .from('invites')
      .insert({
        deal_id: deal.id,
        email: sellerData.email,
        company_name: sellerData.company,
        role: 'SELLER',
        invited_by: user.id,
        token: sellerToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })

    if (sellerInviteError) throw sellerInviteError

    // Create commission record
    if (commissionData) {
      const { error: commissionError } = await supabase
        .from('commissions')
        .insert({
          deal_id: deal.id,
          commission_type: commissionData.type,
          commission_rate: commissionData.amount,
          total_amount: 0, // Calculate based on deal value
          currency: 'USD',
          distributions: [],
          status: 'PENDING',
        })

      if (commissionError) throw commissionError
    }

    // Create notification for broker
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'DEAL_CREATED',
      title: 'Deal Created',
      message: `Deal ${dealNumber} has been created successfully. Invites sent to buyer and seller.`,
      link: `/dashboard/deals/${deal.id}`,
      read: false,
    })

    // Get broker details for email
    const { data: brokerData } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const buyerInviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${buyerToken}`
    const sellerInviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${sellerToken}`

    // Send email invites
    const dealDetails = {
      product: `${dealData.quantity} ${dealData.quantity_unit} ${dealData.product_type}`,
      quantity: `${dealData.quantity} ${dealData.quantity_unit}`,
      value: `$${dealData.estimated_value.toLocaleString()} ${dealData.currency || 'USD'}`,
      location: dealData.location,
    }

    // Send buyer invite email
    await sendInviteEmail({
      to: buyerData.email,
      companyName: buyerData.company,
      contactName: buyerData.name,
      role: 'BUYER',
      dealNumber,
      dealDetails,
      inviteLink: buyerInviteLink,
      brokerName: brokerData?.full_name || 'Your Broker',
    })

    // Send seller invite email
    await sendInviteEmail({
      to: sellerData.email,
      companyName: sellerData.company,
      contactName: sellerData.name,
      role: 'SELLER',
      dealNumber,
      dealDetails,
      inviteLink: sellerInviteLink,
      brokerName: brokerData?.full_name || 'Your Broker',
    })

    return NextResponse.json({
      success: true,
      deal,
      inviteLinks: {
        buyer: buyerInviteLink,
        seller: sellerInviteLink,
      },
    })
  } catch (error: any) {
    console.error('Deal creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    let query = supabase
      .from('deals')
      .select('*, buyer:companies!buyer_id(name), seller:companies!seller_id(name)')

    // Filter based on role
    if (userData?.role === 'BROKER') {
      query = query.eq('broker_id', user.id)
    } else if (userData?.role === 'BUYER') {
      query = query.eq('buyer_id', userData.company_id)
    } else if (userData?.role === 'SELLER') {
      query = query.eq('seller_id', userData.company_id)
    }

    const { data: deals, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ deals })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
