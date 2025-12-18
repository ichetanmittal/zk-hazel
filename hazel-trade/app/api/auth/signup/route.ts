import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, userData, companyData } = body

    // Use service role client for admin operations
    const supabase = createServiceClient()

    // Sign up user with Supabase Auth (using admin API to auto-confirm)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: userData.fullName,
        role: userData.role,
      },
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('Failed to create user')
    }

    // Create company record
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyData.name,
        country: companyData.country,
        registration_number: companyData.registrationNumber,
        year_established: companyData.yearEstablished,
        company_type: companyData.companyType,
        address: companyData.address,
        website: companyData.website || null,
      })
      .select()
      .single()

    if (companyError) {
      console.error('Company creation error:', companyError)
      console.error('Company error details:', JSON.stringify(companyError, null, 2))
      // Clean up auth user if company creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Failed to create company: ${companyError.message}`)
    }

    // Create user record (password_hash is not needed as Supabase Auth handles authentication)
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        password_hash: 'managed_by_supabase_auth', // Placeholder since auth is handled by Supabase Auth
        full_name: userData.fullName,
        role: userData.role,
        company_id: company.id,
        phone: userData.phone || null,
        email_verified: true,
        status: 'ACTIVE',
      })
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      console.error('User error details:', JSON.stringify(userError, null, 2))
      // Clean up if user record creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      await supabase.from('companies').delete().eq('id', company.id)
      throw new Error(`Failed to create user record: ${userError.message}`)
    }

    return NextResponse.json({
      success: true,
      user,
      company,
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'Signup failed' },
      { status: 500 }
    )
  }
}
