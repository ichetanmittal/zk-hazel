/**
 * Quick script to update deal status from DRAFT to PENDING_VERIFICATION
 * Run with: npx tsx scripts/update-deal-status.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateDealStatus() {
  console.log('Updating deal status...')

  // Update any DRAFT deals that have at least one party verified
  const { data, error } = await supabase
    .from('deals')
    .update({ status: 'PENDING_VERIFICATION' })
    .eq('status', 'DRAFT')
    .or('buyer_verified.eq.true,seller_verified.eq.true')
    .select()

  if (error) {
    console.error('Error updating deals:', error)
    return
  }

  console.log(`✅ Updated ${data?.length || 0} deal(s) to PENDING_VERIFICATION`)
  console.log('Deals updated:', data)
}

updateDealStatus()
