'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState<any>(null)
  const [deal, setDeal] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadInvite() {
      try {
        const supabase = createClient()

        // Get invite details
        const { data: inviteData, error: inviteError } = await supabase
          .from('invites')
          .select('*, deals(*), broker:users!invited_by(full_name)')
          .eq('token', token)
          .single()

        if (inviteError) throw new Error('Invalid or expired invite link')

        // Check if expired
        if (new Date(inviteData.expires_at) < new Date()) {
          throw new Error('This invite link has expired')
        }

        // Check if already accepted
        if (inviteData.status === 'ACCEPTED') {
          throw new Error('This invite has already been used')
        }

        setInvite(inviteData)
        setDeal(inviteData.deals)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadInvite()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading invite...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Invite</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Hazel Trade
            </h1>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📨</span>
            </div>
            <CardTitle>You've been invited to a deal</CardTitle>
            <CardDescription>
              Complete verification to access the deal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Deal Info */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 space-y-3">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Deal</p>
                <p className="font-semibold">
                  {deal?.quantity.toLocaleString()} {deal?.quantity_unit} {deal?.product_type.replace('_', ' ')} — {deal?.location}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Invited by</p>
                <p className="font-semibold">{invite?.broker?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Your role</p>
                <p className="font-semibold capitalize">{invite?.role}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href={`/auth/signup?role=${invite?.role?.toLowerCase()}&invite=${token}`}>
                <Button className="w-full" size="lg">
                  Get Started
                </Button>
              </Link>
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link
                  href={`/auth/login?invite=${token}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
