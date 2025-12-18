import CreateDealWizard from '@/components/deals/create-deal-wizard'

export default function NewDealPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Create New Deal</h1>
      <CreateDealWizard />
    </div>
  )
}
