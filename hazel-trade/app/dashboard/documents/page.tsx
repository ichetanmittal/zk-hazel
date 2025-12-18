import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Upload,
  Filter
} from 'lucide-react'

export default async function DocumentsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user details
  const { data: userData } = await supabase
    .from('users')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  const role = userData?.role

  // Get documents based on role
  let docsQuery = supabase
    .from('documents')
    .select('*, deals!inner(deal_number, buyer_id, seller_id, broker_id)')
    .order('created_at', { ascending: false })

  if (role === 'BUYER') {
    docsQuery = docsQuery.eq('deals.buyer_id', userData.company_id)
  } else if (role === 'SELLER') {
    docsQuery = docsQuery.eq('deals.seller_id', userData.company_id)
  } else if (role === 'BROKER') {
    docsQuery = docsQuery.eq('deals.broker_id', user.id)
  }

  const { data: documents } = await docsQuery

  const getDocumentIcon = (type: string) => {
    return <FileText className="w-5 h-5 text-blue-600" />
  }

  const getDocumentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      POF: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      POP: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      AGREEMENTS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      CONTRACTS: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      INSPECTION: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      PAYMENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return colors[type] || 'bg-slate-100 text-slate-800'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Documents</h1>
            <p className="text-slate-600 dark:text-slate-400">
              {documents?.length || 0} total documents
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      {documents && documents.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Document
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Type
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Deal
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Size
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Uploaded
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Status
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {getDocumentIcon(doc.document_type)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {doc.filename}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {doc.document_type}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`text-xs ${getDocumentTypeBadge(doc.folder)}`}>
                          {doc.folder}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {doc.deals?.deal_number}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {formatFileSize(doc.file_size)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        {doc.zk_verified ? (
                          <Badge variant="success" className="text-xs">
                            ✓ ZK Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Upload your first document to get started
            </p>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
