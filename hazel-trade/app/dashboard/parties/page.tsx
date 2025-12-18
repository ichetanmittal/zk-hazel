import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PartiesPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Parties</h1>
      <Card>
        <CardHeader>
          <CardTitle>Buyers & Sellers</CardTitle>
          <CardDescription>Manage your network of buyers and sellers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Parties management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
