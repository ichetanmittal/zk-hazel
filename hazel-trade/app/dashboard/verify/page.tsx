'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import DocumentUpload from '@/components/deals/document-upload'
import { CheckCircle } from 'lucide-react'

export default function VerifyPage() {
  const router = useRouter()
  const [uploaded, setUploaded] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  // This would normally check user role from session
  const userRole = 'BUYER' // or 'SELLER'

  const handleUploadComplete = async (file: File, documentType: string) => {
    setUploaded(true)
    setVerifying(true)

    // Simulate ZK verification
    setTimeout(() => {
      setVerifying(false)
      setVerified(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }, 3000)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {userRole === 'BUYER' ? 'Upload Proof of Funds' : 'Upload Proof of Product'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Complete verification to access your deals
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

        <DocumentUpload
          type={userRole === 'BUYER' ? 'POF' : 'POP'}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    </div>
  )
}
