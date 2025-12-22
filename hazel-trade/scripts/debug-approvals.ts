/**
 * Debug script to check party approvals
 * Run with: source .env.local && npx tsx scripts/debug-approvals.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables. Run with: source .env.local && npx tsx scripts/debug-approvals.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugApprovals() {
  const dealId = 'bd60b3c4-c5b7-4ebb-91ea-86fbb786badd'

  console.log('🔍 Checking party approvals for deal:', dealId)

  // Query all party approvals for this deal
  const { data: approvals, error } = await supabase
    .from('step_party_approvals')
    .select('*')
    .eq('deal_id', dealId)
    .order('step_number', { ascending: true })
    .order('party_role', { ascending: true })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log('\n📋 Party Approvals:')
  console.table(approvals)

  // Call the RPC function
  console.log('\n🔧 Testing RPC function for Step 1:')
  const { data: result, error: rpcError } = await supabase
    .rpc('check_step_all_parties_approved', {
      p_deal_id: dealId,
      p_step_number: 1
    })

  if (rpcError) {
    console.error('❌ RPC Error:', rpcError)
  } else {
    console.log('Result:', result)
    console.log('Expected: false (because only SELLER approved, not BUYER/BROKER)')
  }
}

debugApprovals()
