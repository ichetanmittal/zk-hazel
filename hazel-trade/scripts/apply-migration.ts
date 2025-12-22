/**
 * Apply migration to fix party approvals RLS
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  console.log('📝 Reading migration file...')

  const migrationPath = resolve(process.cwd(), 'supabase/migrations/004_fix_party_approvals_rls.sql')
  const sql = readFileSync(migrationPath, 'utf-8')

  console.log('🚀 Applying migration...')
  console.log('---')
  console.log(sql)
  console.log('---')

  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
      if (error) {
        console.error('❌ Error executing statement:', error)
        console.error('Statement:', statement.substring(0, 100) + '...')
      }
    } catch (err) {
      console.error('❌ Error:', err)
    }
  }

  console.log('✅ Migration applied!')
}

applyMigration()
