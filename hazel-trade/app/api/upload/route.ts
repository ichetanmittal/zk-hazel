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
    const companyId = formData.get('companyId') as string
    const userRole = formData.get('userRole') as string

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
        .update({ verification_status: 'VERIFIED', verified_at: new Date().toISOString() })
        .eq('id', createdDocument.id)

      // If this is a POF or POP document, update the deal verification status
      if (folder === 'POF' || folder === 'POP') {
        const verificationField = folder === 'POF' ? 'buyer_verified' : 'seller_verified'

        await (supabaseClient as any)
          .from('deals')
          .update({ [verificationField]: true })
          .eq('id', dealId)

        console.log(`✓ Set ${verificationField} = true for deal ${dealId}`)
      }

      // AUTO-COMPLETE STEP: If this is a step document, automatically complete the step
      if (stepNumber && parseInt(stepNumber) > 0) {
        const currentStepNumber = parseInt(stepNumber)

        // Get deal to check current_step
        const { data: deal } = await (supabaseClient as any)
          .from('deals')
          .select('current_step, status')
          .eq('id', dealId)
          .single()

        // Only auto-complete if this is the current step
        if (deal && deal.current_step === currentStepNumber) {
          console.log(`✓ Auto-completing Step ${currentStepNumber} after document upload`)

          // Mark current step as completed
          await (supabaseClient as any)
            .from('deal_steps')
            .update({
              status: 'COMPLETED',
              completed_at: new Date().toISOString(),
              completed_by: user.id,
            })
            .eq('deal_id', dealId)
            .eq('step_number', currentStepNumber)

          // Advance to next step
          const newStep = Math.min(currentStepNumber + 1, 12)

          await (supabaseClient as any)
            .from('deals')
            .update({
              current_step: newStep,
              status: newStep > 12 ? 'COMPLETED' : 'IN_PROGRESS',
            })
            .eq('id', dealId)

          // Mark next step as IN_PROGRESS
          if (newStep <= 12) {
            await (supabaseClient as any)
              .from('deal_steps')
              .update({
                status: 'IN_PROGRESS',
                started_at: new Date().toISOString(),
              })
              .eq('deal_id', dealId)
              .eq('step_number', newStep)
          }

          console.log(`✓ Advanced to Step ${newStep}`)

          // Create step completion notification
          const { data: dealData } = await (supabaseClient as any)
            .from('deals')
            .select(`
              *,
              buyer:companies!buyer_id(id),
              seller:companies!seller_id(id)
            `)
            .eq('id', dealId)
            .single()

          if (dealData) {
            // Get all users associated with this deal
            const { data: users } = await (supabaseClient as any)
              .from('users')
              .select('id')
              .or(
                `company_id.eq.${dealData.buyer?.id},company_id.eq.${dealData.seller?.id},id.eq.${dealData.broker_id}`
              )

            if (users) {
              const notifications = users.map((u: any) => ({
                user_id: u.id,
                deal_id: dealId,
                type: 'STEP_COMPLETED',
                title: `Step ${currentStepNumber} Completed`,
                message: `Step ${currentStepNumber} has been automatically completed after document upload.`,
                action_url: `/dashboard/deals/${dealId}`,
                read: false,
              }))

              await (supabaseClient as any).from('notifications').insert(notifications)
            }
          }
        }
      }

      // Create notification
      await (supabaseClient as any).from('notifications').insert({
        user_id: user.id,
        deal_id: dealId,
        type: 'VERIFICATION_COMPLETE',
        title: 'Document Verified',
        message: `Your document "${file.name}" has been ZK verified successfully.`,
        action_url: `/dashboard/deals/${dealId}`,
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
