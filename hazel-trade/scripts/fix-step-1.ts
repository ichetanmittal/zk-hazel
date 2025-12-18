/**
 * Quick script to activate Step 1 for matched deals
 * Run with: npx tsx scripts/fix-step-1.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixStep1() {
  console.log('🔧 Fixing Step 1 activation for matched deals...\n')

  // Get all matched deals
  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select('id, deal_number, status')
    .eq('status', 'MATCHED')

  if (dealsError) {
    console.error('❌ Error fetching deals:', dealsError)
    return
  }

  if (!deals || deals.length === 0) {
    console.log('✅ No matched deals found')
    return
  }

  console.log(`📊 Found ${deals.length} matched deal(s):\n`)

  for (const deal of deals) {
    console.log(`  Processing: ${deal.deal_number}`)

    // Update Step 1 to IN_PROGRESS
    const { data: step, error: stepError } = await supabase
      .from('deal_steps')
      .update({
        status: 'IN_PROGRESS',
        started_at: new Date().toISOString(),
      })
      .eq('deal_id', deal.id)
      .eq('step_number', 1)
      .select()
      .single()

    if (stepError) {
      console.error(`    ❌ Error updating step:`, stepError.message)
    } else {
      console.log(`    ✅ Step 1 activated (status: ${step.status})`)
    }
  }

  console.log('\n✅ Done!')
}

fixStep1()
