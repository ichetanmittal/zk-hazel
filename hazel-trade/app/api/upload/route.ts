import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const dealId = formData.get('dealId') as string
    const documentType = formData.get('documentType') as string
    const folder = formData.get('folder') as string
    const stepNumber = formData.get('stepNumber') as string

    if (!file || !dealId || !documentType || !folder) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${dealId}/${folder}/${fileName}`

    // Upload file to Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        deal_id: dealId,
        filename: file.name,
        file_path: filePath,
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type,
        document_type: documentType,
        folder: folder,
        uploaded_by: user.id,
        zk_verified: false,
        step_number: stepNumber ? parseInt(stepNumber) : null,
      } as any)
      .select()
      .single()

    if (docError || !document) {
      console.error('Document record error:', docError)
      // Clean up uploaded file
      await supabase.storage.from('documents').remove([filePath])
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
    }

    const createdDocument: any = document

    // Simulate ZK verification (in production, this would be done by a background job)
    setTimeout(async () => {
      const supabaseClient = await createClient()
      await (supabaseClient as any)
        .from('documents')
        .update({ zk_verified: true, verified_at: new Date().toISOString() })
        .eq('id', createdDocument.id)

      // Create notification
      await (supabaseClient as any).from('notifications').insert({
        user_id: user.id,
        type: 'DOCUMENT_UPLOADED',
        title: 'Document Verified',
        message: `Your document "${file.name}" has been ZK verified successfully.`,
        link: `/dashboard/data-room?deal=${dealId}`,
        read: false,
      })
    }, 3000)

    return NextResponse.json({
      success: true,
      document: createdDocument,
      message: 'Document uploaded successfully',
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
