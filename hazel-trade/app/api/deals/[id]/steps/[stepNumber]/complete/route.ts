import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; stepNumber: string }> }
) {
  try {
    const { id: dealId, stepNumber: stepNumberStr } = await params
    const stepNumber = parseInt(stepNumberStr)
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current step
    const { data: step, error: stepError } = await supabase
      .from('deal_steps')
      .select('*')
      .eq('deal_id', dealId)
      .eq('step_number', stepNumber)
      .single()

    if (stepError || !step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    const currentStep: any = step

    if (currentStep.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Step already completed' }, { status: 400 })
    }

    // Mark step as completed
    const { error: updateError } = await supabase
      .from('deal_steps')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        completed_by: user.id,
      })
      .eq('deal_id', dealId)
      .eq('step_number', stepNumber)

    if (updateError) {
      throw updateError
    }

    // Update deal current_step if this was the current step
    const { data: deal } = await supabase
      .from('deals')
      .select('current_step, status')
      .eq('id', dealId)
      .single()

    const currentDeal: any = deal

    if (currentDeal && currentDeal.current_step === stepNumber) {
      // Move to next step
      const newStep = Math.min(stepNumber + 1, 12)

      await supabase
        .from('deals')
        .update({
          current_step: newStep,
          status: newStep === 12 ? 'COMPLETED' : 'IN_PROGRESS',
        })
        .eq('id', dealId)

      // Mark next step as IN_PROGRESS
      if (newStep <= 12) {
        await supabase
          .from('deal_steps')
          .update({
            status: 'IN_PROGRESS',
            started_at: new Date().toISOString(),
          })
          .eq('deal_id', dealId)
          .eq('step_number', newStep)
      }
    }

    // Get all parties for notifications
    const { data: dealData } = await supabase
      .from('deals')
      .select(`
        *,
        buyer:companies!buyer_id(id),
        seller:companies!seller_id(id)
      `)
      .eq('id', dealId)
      .single()

    const fullDeal: any = dealData

    // Create notifications for all parties
    if (fullDeal) {
      // Get all users associated with this deal
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .or(
          `company_id.eq.${fullDeal.buyer?.id},company_id.eq.${fullDeal.seller?.id},id.eq.${fullDeal.broker_id}`
        )

      if (users) {
        const notifications = users.map((u: any) => ({
          user_id: u.id,
          deal_id: dealId,
          type: 'STEP_COMPLETED',
          title: `Step ${stepNumber} Completed`,
          message: `${currentStep.step_name} has been marked as complete.`,
          action_url: `/dashboard/deals/${dealId}`,
          read: false,
        }))

        await supabase.from('notifications').insert(notifications)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Step marked as complete',
    })
  } catch (error: any) {
    console.error('Step completion error:', error)
    return NextResponse.json({ error: error.message || 'Failed to complete step' }, { status: 500 })
  }
}
