'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, X, Loader2, CheckCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StepDocumentUploadProps {
  dealId: string
  stepNumber: number
  documents: any[]
  requiredParties?: string[]
  partyApprovals?: any[]
  currentUserRole?: string
}

export default function StepDocumentUpload({
  dealId,
  stepNumber,
  documents,
  requiredParties = [],
  partyApprovals = [],
  currentUserRole,
}: StepDocumentUploadProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  // Check if current user's role has already approved
  const currentUserApproved = partyApprovals.find(
    (approval: any) => approval.party_role === currentUserRole && approval.approved
  )

  // Check if current user can upload (their role is required and hasn't approved yet)
  const canUpload = requiredParties.includes(currentUserRole || '') && !currentUserApproved

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setError('File size must be less than 10MB')
        return
      }

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg']
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload PDF, DOC, DOCX, PNG, or JPG files only')
        return
      }

      setError('')
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('dealId', dealId)
      formData.append('documentType', 'OTHER')
      formData.append('folder', 'AGREEMENTS')
      formData.append('stepNumber', stepNumber.toString())

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      // Success - refresh the page to show new document
      setSelectedFile(null)
      router.refresh()
    } catch (err) {
      setError('Failed to upload document. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      {/* Party Approval Status Card */}
      {requiredParties.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Party Approvals</CardTitle>
            <CardDescription>
              This step requires approval from multiple parties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requiredParties.map((party) => {
                const approval = partyApprovals.find((a: any) => a.party_role === party)
                const isApproved = approval?.approved
                const isCurrentUser = party === currentUserRole

                return (
                  <div
                    key={party}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isApproved
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                        : isCurrentUser
                        ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isApproved ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {party}
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              You
                            </Badge>
                          )}
                        </p>
                        {isApproved && approval.approved_at && (
                          <p className="text-xs text-slate-500" suppressHydrationWarning>
                            Approved {new Date(approval.approved_at).toISOString().split('T')[0]}
                          </p>
                        )}
                      </div>
                    </div>
                    {isApproved ? (
                      <Badge variant="default" className="bg-green-600">
                        Approved
                      </Badge>
                    ) : isCurrentUser ? (
                      <Badge variant="secondary">Action Required</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Upload Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Documents</CardTitle>
            {canUpload ? (
              <label htmlFor="file-upload">
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </span>
                </Button>
              </label>
            ) : currentUserApproved ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                You've Approved
              </Badge>
            ) : (
              <Badge variant="secondary">Not Your Turn</Badge>
            )}
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              disabled={!canUpload}
            />
          </div>
          <CardDescription>
            {canUpload
              ? 'Upload your documents to approve this step'
              : currentUserApproved
              ? 'You have completed your part. Waiting for other parties.'
              : requiredParties.length > 0
              ? `Only ${requiredParties.join(', ')} can upload to this step`
              : 'Documents related to this step'}
          </CardDescription>
        </CardHeader>
        <CardContent>
        {/* File Selected for Upload */}
        {selectedFile && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Existing Documents */}
        {documents && documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc: any) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{doc.filename}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(doc.created_at).toISOString().split('T')[0]}
                    </p>
                  </div>
                </div>
                {doc.zk_verified && (
                  <Badge variant="default" style={{ backgroundColor: 'rgb(220 252 231)', color: 'rgb(21 128 61)' }} className="text-xs">
                    ✓ Verified
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">No documents uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  )
}
