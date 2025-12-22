'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, File, X, CheckCircle, Loader2, Info } from 'lucide-react'
import { POF_TYPES, POP_TYPES } from '@/lib/utils/constants'

interface DocumentUploadFormProps {
  type: 'POF' | 'POP'
  dealId: string
  companyId: string
  userRole: 'BUYER' | 'SELLER'
  onUploadComplete?: (result: any) => void
}

export default function DocumentUploadForm({
  type,
  dealId,
  companyId,
  userRole,
  onUploadComplete
}: DocumentUploadFormProps) {
  const [selectedType, setSelectedType] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const documentTypes = type === 'POF' ? POF_TYPES : POP_TYPES
  const folder = type === 'POF' ? 'POF' : 'POP'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const selected = e.target.files?.[0]
    if (selected) {
      // Validate file size (10MB max)
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg'
      ]
      if (!allowedTypes.includes(selected.type)) {
        setError('Only PDF, DOC, and image files are allowed')
        return
      }

      setFile(selected)
    }
  }

  const handleUpload = async () => {
    if (!file || !selectedType) {
      setError('Please select document type and file')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('dealId', dealId)
      formData.append('documentType', selectedType)
      formData.append('folder', folder)
      formData.append('stepNumber', '0') // Step 0 for initial verification
      formData.append('companyId', companyId)
      formData.append('userRole', userRole)

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Call onUploadComplete callback
      onUploadComplete?.(result)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed. Please try again.')
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Document Type Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Document Type *</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      {type === 'POF'
                        ? 'Proof of Funds documents verify you have the financial capacity to complete this purchase.'
                        : 'Proof of Product documents verify you have the commodity available for sale.'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((doc) => (
                  <SelectItem key={doc.value} value={doc.value}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{doc.label}</span>
                            <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 flex-shrink-0" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-sm">
                          <p className="text-xs">{doc.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload Area */}
          <div>
            <Label>Upload Document *</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 cursor-pointer'
              }`}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              {!file ? (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 mx-auto text-slate-400" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-xs text-slate-500">
                    PDF, DOC, PNG, JPG up to 10MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <File className="w-12 h-12 mx-auto text-blue-500" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
          </div>

          {/* Upload Button */}
          {file && (
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={uploading || !selectedType}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading & Verifying...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Verify
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              🔒 Your document will be ZK verified. We prove you have {type === 'POF' ? 'funds' : 'product'} WITHOUT exposing sensitive details to the other party.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
