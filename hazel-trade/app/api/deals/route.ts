import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
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
      buyerType,
      sellerData,
      sellerType,
      commissionData,
    } = body

    // Generate deal number
    const year = new Date().getFullYear()
    const { count } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })

    const dealNumber = `HT-${year}-${String((count || 0) + 1).padStart(4, '0')}`

    // Determine buyer_id and seller_id
    let buyerId = null
    let sellerId = null

    // If using existing buyer, get the company ID directly
    if (buyerType === 'existing' && buyerData.existingCompanyId) {
      buyerId = buyerData.existingCompanyId
    }

    // If using existing seller, get the company ID directly
    if (sellerType === 'existing' && sellerData.existingCompanyId) {
      sellerId = sellerData.existingCompanyId
    }

    // Create deal
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .insert({
        deal_number: dealNumber,
        ...dealData,
        broker_id: user.id,
        buyer_id: buyerId,
        seller_id: sellerId,
        status: buyerType === 'existing' && sellerType === 'existing' ? 'MATCHED' : 'PENDING_VERIFICATION',
        buyer_verified: buyerType === 'existing',
        seller_verified: sellerType === 'existing',
        matched_at: buyerType === 'existing' && sellerType === 'existing' ? new Date().toISOString() : null,
        current_step: 1,
      })
      .select()
      .single()

    if (dealError || !deal) {
      throw dealError || new Error('Failed to create deal')
    }

    const createdDeal: any = deal

    // Create deal steps
    const stepsToCreate = DEAL_STEPS.map(step => ({
      deal_id: createdDeal.id,
      step_number: step.number,
      step_name: step.name,
      status: 'PENDING' as const,
    }))

    const { error: stepsError } = await supabase
      .from('deal_steps')
      .insert(stepsToCreate as any)

    if (stepsError) throw stepsError

    // If both buyer and seller are existing, activate Step 1 immediately
    if (buyerType === 'existing' && sellerType === 'existing') {
      // Use service client to bypass RLS for admin operations
      const serviceSupabase = createServiceClient()

      await serviceSupabase
        .from('deal_steps')
        .update({
          status: 'IN_PROGRESS',
          started_at: new Date().toISOString(),
        })
        .eq('deal_id', createdDeal.id)
        .eq('step_number', 1)

      // Initialize party approvals for Step 1 (using service client to bypass RLS)
      const step1Info = DEAL_STEPS.find((s) => s.number === 1)
      if (step1Info && step1Info.requiredParties) {
        const { error: initError } = await serviceSupabase.rpc('initialize_step_party_approvals', {
          p_deal_id: createdDeal.id,
          p_step_number: 1,
          p_required_parties: step1Info.requiredParties,
        })

        if (initError) {
          console.error('❌ Failed to initialize Step 1 party approvals:', initError)
        } else {
          console.log(`✅ Initialized party approvals for Step 1: ${step1Info.requiredParties.join(', ')}`)
        }
      }
    }

    // Create buyer invite (only if new buyer)
    let buyerToken = null
    if (buyerType === 'new') {
      buyerToken = crypto.randomUUID()
      const { error: buyerInviteError } = await supabase
        .from('invites')
        .insert({
          deal_id: createdDeal.id,
          email: buyerData.email,
          company_name: buyerData.company,
          role: 'BUYER',
          invited_by: user.id,
          token: buyerToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        } as any)

      if (buyerInviteError) throw buyerInviteError
    }

    // Create seller invite (only if new seller)
    let sellerToken = null
    if (sellerType === 'new') {
      sellerToken = crypto.randomUUID()
      const { error: sellerInviteError } = await supabase
        .from('invites')
        .insert({
          deal_id: createdDeal.id,
          email: sellerData.email,
          company_name: sellerData.company,
          role: 'SELLER',
          invited_by: user.id,
          token: sellerToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        } as any)

      if (sellerInviteError) throw sellerInviteError
    }

    // Create commission record
    if (commissionData) {
      const { error: commissionError } = await supabase
        .from('commissions')
        .insert({
          deal_id: createdDeal.id,
          commission_type: commissionData.type,
          commission_rate: commissionData.amount,
          total_amount: 0, // Calculate based on deal value
          currency: 'USD',
          distributions: [],
          status: 'PENDING',
        } as any)

      if (commissionError) throw commissionError
    }

    // Create notification for broker
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'DEAL_CREATED',
      title: 'Deal Created',
      message: `Deal ${dealNumber} has been created successfully. Invites sent to buyer and seller.`,
      link: `/dashboard/deals/${createdDeal.id}`,
      read: false,
    } as any)

    // Get broker details for email
    const { data: brokerData }: any = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const inviteLinks: { buyer?: string; seller?: string } = {}

    // Send email invites only for new companies
    if (buyerType === 'new' && buyerToken) {
      const buyerInviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${buyerToken}`
      inviteLinks.buyer = buyerInviteLink

      const dealDetails = {
        product: `${dealData.quantity} ${dealData.quantity_unit} ${dealData.product_type}`,
        quantity: `${dealData.quantity} ${dealData.quantity_unit}`,
        value: `$${dealData.estimated_value.toLocaleString()} ${dealData.currency || 'USD'}`,
        location: dealData.location,
      }

      await sendInviteEmail({
        to: buyerData.email,
        companyName: buyerData.company,
        contactName: buyerData.contact,
        role: 'BUYER',
        dealNumber,
        dealDetails,
        inviteLink: buyerInviteLink,
        brokerName: brokerData?.full_name || 'Your Broker',
      })
    }

    if (sellerType === 'new' && sellerToken) {
      const sellerInviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${sellerToken}`
      inviteLinks.seller = sellerInviteLink

      const dealDetails = {
        product: `${dealData.quantity} ${dealData.quantity_unit} ${dealData.product_type}`,
        quantity: `${dealData.quantity} ${dealData.quantity_unit}`,
        value: `$${dealData.estimated_value.toLocaleString()} ${dealData.currency || 'USD'}`,
        location: dealData.location,
      }

      await sendInviteEmail({
        to: sellerData.email,
        companyName: sellerData.company,
        contactName: sellerData.contact,
        role: 'SELLER',
        dealNumber,
        dealDetails,
        inviteLink: sellerInviteLink,
        brokerName: brokerData?.full_name || 'Your Broker',
      })
    }

    return NextResponse.json({
      success: true,
      deal: createdDeal,
      inviteLinks,
      message: buyerType === 'existing' && sellerType === 'existing'
        ? 'Deal created and matched with existing buyer and seller!'
        : buyerType === 'existing' || sellerType === 'existing'
        ? 'Deal created. Invites sent to new parties.'
        : 'Deal created. Invites sent to buyer and seller.',
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
    const { data: userData }: any = await supabase
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
