'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import DocumentUploadForm from '@/components/deals/document-upload-form'

export default function VerifyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<'BUYER' | 'SELLER' | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [pendingDeals, setPendingDeals] = useState<any[]>([])
  const [uploaded, setUploaded] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get user details
      const { data: userData } = await supabase
        .from('users')
        .select('role, company_id')
        .eq('id', user.id)
        .single()

      if (userData) {
        setUserRole(userData.role as 'BUYER' | 'SELLER')
        setCompanyId(userData.company_id)

        // Get pending deals for this company
        const roleField = userData.role === 'BUYER' ? 'buyer_id' : 'seller_id'
        const verifiedField = userData.role === 'BUYER' ? 'buyer_verified' : 'seller_verified'

        const { data: deals } = await supabase
          .from('deals')
          .select('*')
          .eq(roleField, userData.company_id)
          .eq(verifiedField, false)
          .in('status', ['DRAFT', 'PENDING_VERIFICATION'])

        console.log('Found pending deals:', deals)
        setPendingDeals(deals || [])
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = async (result: any) => {
    setUploaded(true)
    setVerifying(true)

    // Wait for ZK verification simulation
    setTimeout(() => {
      setVerifying(false)
      setVerified(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)
    }, 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Verification Complete!</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Your {userRole === 'BUYER' ? 'Proof of Funds' : 'Proof of Product'} has been ZK verified.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm">
                <p className="text-green-900 dark:text-green-100">
                  ✓ Status: ZK Verified<br/>
                  ✓ Verified: {new Date().toLocaleString()}<br/>
                  ✓ Proof ID: 0x{Math.random().toString(16).substring(2, 10)}...
                </p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                Redirecting to dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Verifying Your Documents</h2>
              <div className="space-y-2 text-left max-w-xs mx-auto">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Document uploaded</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Hash generated</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating zero-knowledge proof...</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="w-4 h-4 border-2 border-slate-300 rounded-full"></div>
                  <span>Publishing verification</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                This usually takes 30-60 seconds.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!pendingDeals || pendingDeals.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Pending Verification</CardTitle>
            <CardDescription>
              You don't have any deals pending verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const deal = pendingDeals[0]

  const handleSkip = () => {
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {userRole === 'BUYER' ? 'Upload Proof of Funds' : 'Upload Proof of Product'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Complete verification to access deal {deal.deal_number}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 mb-2">
            <div className="h-2 flex-1 rounded bg-blue-600" />
            <div className="h-2 flex-1 rounded bg-blue-600" />
            <div className="h-2 flex-1 rounded bg-blue-600" />
            <div className="h-2 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <p className="text-sm text-slate-600 text-center">Step 3 of 4</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DocumentUploadForm
              type={userRole === 'BUYER' ? 'POF' : 'POP'}
              dealId={deal.id}
              companyId={companyId!}
              userRole={userRole!}
              onUploadComplete={handleUploadComplete}
            />

            <div className="mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="w-full"
              >
                Skip for Now
              </Button>
              <p className="text-xs text-center text-slate-500 mt-2">
                You can complete verification later from your dashboard. Your deal will remain in pending state.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
