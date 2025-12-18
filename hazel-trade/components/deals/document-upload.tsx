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
import { Card, CardContent } from '@/components/ui/card'
import { Upload, File, X, CheckCircle, Loader2 } from 'lucide-react'
import { POF_TYPES, POP_TYPES } from '@/lib/utils/constants'

interface DocumentUploadProps {
  type: 'POF' | 'POP'
  onUploadComplete?: (file: File, documentType: string) => void
}

export default function DocumentUpload({ type, onUploadComplete }: DocumentUploadProps) {
  const [selectedType, setSelectedType] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const documentTypes = type === 'POF' ? POF_TYPES : POP_TYPES

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      // Validate file size (10MB max)
      if (selected.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(selected.type)) {
        alert('Only PDF and DOC files are allowed')
        return
      }

      setFile(selected)
    }
  }

  const handleUpload = async () => {
    if (!file || !selectedType) {
      alert('Please select document type and file')
      return
    }

    setUploading(true)

    try {
      // Simulate upload and ZK verification
      await new Promise(resolve => setTimeout(resolve, 2000))

      setUploaded(true)
      onUploadComplete?.(file, selectedType)
    } catch (error) {
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setUploaded(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Document Type Selection */}
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((doc) => (
                  <SelectItem key={doc.value} value={doc.value}>
                    {doc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload Area */}
          <div>
            <Label>Upload Document</Label>
            <div
              className="mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {!file ? (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 mx-auto text-slate-400" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-xs text-slate-500">
                    PDF, DOC up to 10MB
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
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Upload Button */}
          {file && !uploaded && (
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={uploading || !selectedType}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
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

          {/* Success State */}
          {uploaded && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    Verification Complete
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your document has been ZK verified
                  </p>
                </div>
              </div>
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
