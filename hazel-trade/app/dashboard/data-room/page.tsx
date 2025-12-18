import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Lock, Folder, Upload } from 'lucide-react'

export default async function DataRoomPage({ searchParams }: { searchParams: { deal?: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const dealId = searchParams.deal

  if (!dealId) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Data Room</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Select a deal to view its data room
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get deal details
  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .select('*')
    .eq('id', dealId)
    .single()

  if (dealError || !deal) {
    return <div className="p-8">Deal not found</div>
  }

  const currentDeal: any = deal

  // Get user role for document visibility
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = (userData as any)?.role

  // Get documents for this deal
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })

  const allDocuments: any[] = documents || []

  // Filter documents based on role and visibility
  const dealDocuments = allDocuments.filter((doc) => {
    if (userRole === 'BROKER') {
      return doc.visible_to_broker
    } else if (userRole === 'BUYER') {
      return doc.visible_to_buyer
    } else if (userRole === 'SELLER') {
      return doc.visible_to_seller
    }
    return false
  })

  // Group documents by folder
  const folders = {
    AGREEMENTS: { name: 'Agreements', icon: '📋', unlocked: true, docs: [] as any[] },
    POF: { name: 'Proof of Funds', icon: '💰', unlocked: currentDeal.buyer_verified, docs: [] as any[] },
    POP: { name: 'Proof of Product', icon: '🛢️', unlocked: currentDeal.seller_verified, docs: [] as any[] },
    CONTRACTS: { name: 'SPA & Contracts', icon: '📝', unlocked: currentDeal.current_step >= 6, docs: [] as any[] },
    INSPECTION: { name: 'Inspection Reports', icon: '🔬', unlocked: currentDeal.current_step >= 8, docs: [] as any[] },
    PAYMENT: { name: 'Payment Documents', icon: '💳', unlocked: currentDeal.current_step >= 10, docs: [] as any[] },
  }

  // Group documents
  dealDocuments.forEach((doc) => {
    if (folders[doc.folder as keyof typeof folders]) {
      folders[doc.folder as keyof typeof folders].docs.push(doc)
    }
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Room</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Deal {currentDeal.deal_number} • Secure document vault
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(folders).map(([key, folder]) => (
          <Card
            key={key}
            className={`${
              folder.unlocked
                ? 'hover:shadow-lg transition-shadow cursor-pointer'
                : 'opacity-60'
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl">{folder.icon}</div>
                {folder.unlocked ? (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Unlocked
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Locked
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{folder.name}</CardTitle>
              <CardDescription>
                {folder.docs.length} document{folder.docs.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {folder.unlocked ? (
                <>
                  {folder.docs.length > 0 ? (
                    <div className="space-y-2">
                      {folder.docs.slice(0, 3).map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between gap-2 text-sm p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="truncate">{doc.filename}</span>
                          </div>
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                          >
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </a>
                        </div>
                      ))}
                      {folder.docs.length > 3 && (
                        <p className="text-xs text-slate-500">
                          +{folder.docs.length - 3} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Folder className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500">No documents yet</p>
                      <Button variant="ghost" size="sm" className="mt-2">
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <Lock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500">
                    {key === 'POF' && 'Unlocks after buyer verification'}
                    {key === 'POP' && 'Unlocks after seller verification'}
                    {key === 'CONTRACTS' && 'Unlocks after SPA signing'}
                    {key === 'INSPECTION' && 'Unlocks after DTA issued'}
                    {key === 'PAYMENT' && 'Unlocks after Q&Q inspection'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Document Visibility Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Before Match:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Buyer sees: Own POF documents only</li>
                <li>• Seller sees: Own POP documents only</li>
                <li>• Broker sees: All documents</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">After Match:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Buyer sees: Own POF + Seller's POP + Shared docs</li>
                <li>• Seller sees: Own POP + Buyer's POF + Shared docs</li>
                <li>• Broker sees: All documents</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
