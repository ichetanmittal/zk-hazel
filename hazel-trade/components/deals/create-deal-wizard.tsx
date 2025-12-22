'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PRODUCT_TYPES, QUANTITY_UNITS, DELIVERY_TERMS, COMMISSION_TYPES } from '@/lib/utils/constants'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Info } from 'lucide-react'

export default function CreateDealWizard() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Deal Details
  const [productType, setProductType] = useState('')
  const [quantity, setQuantity] = useState('')
  const [quantityUnit, setQuantityUnit] = useState('')
  const [estimatedValue, setEstimatedValue] = useState('')
  const [deliveryTerms, setDeliveryTerms] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  // Step 2: Buyer
  const [buyerType, setBuyerType] = useState<'new' | 'existing'>('new')
  const [buyerCompany, setBuyerCompany] = useState('')
  const [buyerContact, setBuyerContact] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [selectedBuyerId, setSelectedBuyerId] = useState('')
  const [existingBuyers, setExistingBuyers] = useState<any[]>([])

  // Step 3: Seller
  const [sellerType, setSellerType] = useState<'new' | 'existing'>('new')
  const [sellerCompany, setSellerCompany] = useState('')
  const [sellerContact, setSellerContact] = useState('')
  const [sellerEmail, setSellerEmail] = useState('')
  const [sellerPhone, setSellerPhone] = useState('')
  const [selectedSellerId, setSelectedSellerId] = useState('')
  const [existingSellers, setExistingSellers] = useState<any[]>([])

  // Step 4: Commission
  const [commissionType, setCommissionType] = useState('')
  const [commissionAmount, setCommissionAmount] = useState('')
  const [splitCommission, setSplitCommission] = useState(false)

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!productType || !quantity || !quantityUnit || !estimatedValue || !deliveryTerms || !location) {
      setError('Please fill all required fields')
      return
    }
    setStep(2)
  }

  // Fetch existing companies when step changes
  useEffect(() => {
    const fetchExistingCompanies = async () => {
      if (step === 2) {
        // Fetch buyers
        const response = await fetch('/api/companies?role=buyer')
        const data = await response.json()
        if (data.companies) {
          setExistingBuyers(data.companies)
        }
      } else if (step === 3) {
        // Fetch sellers
        const response = await fetch('/api/companies?role=seller')
        const data = await response.json()
        if (data.companies) {
          setExistingSellers(data.companies)
        }
      }
    }
    fetchExistingCompanies()
  }, [step])

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate based on buyer type
    if (buyerType === 'new') {
      if (!buyerCompany || !buyerContact || !buyerEmail) {
        setError('Please fill all required fields')
        return
      }
    } else {
      if (!selectedBuyerId) {
        setError('Please select a buyer')
        return
      }
    }

    setStep(3)
  }

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate based on seller type
    if (sellerType === 'new') {
      if (!sellerCompany || !sellerContact || !sellerEmail) {
        setError('Please fill all required fields')
        return
      }
    } else {
      if (!selectedSellerId) {
        setError('Please select a seller')
        return
      }
    }

    setStep(4)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Prepare buyer data based on type
      const buyerData = buyerType === 'existing'
        ? { existingCompanyId: selectedBuyerId }
        : {
            company: buyerCompany,
            contact: buyerContact,
            email: buyerEmail,
            phone: buyerPhone || null,
          }

      // Prepare seller data based on type
      const sellerData = sellerType === 'existing'
        ? { existingCompanyId: selectedSellerId }
        : {
            company: sellerCompany,
            contact: sellerContact,
            email: sellerEmail,
            phone: sellerPhone || null,
          }

      // Call API to create deal
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealData: {
            product_type: productType,
            quantity: parseFloat(quantity),
            quantity_unit: quantityUnit,
            estimated_value: parseFloat(estimatedValue),
            currency: 'USD',
            delivery_terms: deliveryTerms,
            location,
            notes: notes || null,
          },
          buyerData,
          buyerType,
          sellerData,
          sellerType,
          commissionData: commissionType && commissionAmount ? {
            type: commissionType,
            amount: parseFloat(commissionAmount),
          } : null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create deal')
      }

      // Show success toast
      toast({
        variant: "success",
        title: `Deal ${result.deal.deal_number} Created Successfully!`,
        description: result.message,
      })

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Step {step} of 4</span>
          <span className="text-sm text-slate-600">
            {step === 1 && 'Deal Details'}
            {step === 2 && 'Add Buyer'}
            {step === 3 && 'Add Seller'}
            {step === 4 && 'Commission'}
          </span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded ${
                s <= step ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Step 1: Deal Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Deal Details</CardTitle>
            <CardDescription>Enter the commodity and terms</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStep1} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Product Type *</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">Hover over each product type for detailed information about the commodity.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={productType} onValueChange={setProductType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-between w-full gap-2">
                                  <span>{p.label}</span>
                                  <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 flex-shrink-0" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-sm">
                                <p className="text-xs">{p.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Delivery Terms *</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">INCOTERMS define who pays for shipping, insurance, and when risk transfers.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={deliveryTerms} onValueChange={setDeliveryTerms}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_TERMS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-between w-full gap-2">
                                  <span>{d.label}</span>
                                  <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 flex-shrink-0" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-sm">
                                <p className="text-xs">{d.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Unit *</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">Standard measurement units for commodity trading.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={quantityUnit} onValueChange={setQuantityUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUANTITY_UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-between w-full gap-2">
                                  <span>{u.label}</span>
                                  <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 flex-shrink-0" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-sm">
                                <p className="text-xs">{u.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estimated Value (USD) *</Label>
                  <Input
                    type="number"
                    placeholder="34300000"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input
                    placeholder="Rotterdam, Netherlands"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="Additional deal information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit">Next: Add Buyer</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Add Buyer */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Add Buyer</CardTitle>
            <CardDescription>Who is purchasing the commodity?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStep2} className="space-y-4">
              {/* Radio button selection */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="buyerType"
                      value="new"
                      checked={buyerType === 'new'}
                      onChange={() => {
                        setBuyerType('new')
                        setSelectedBuyerId('')
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Invite New Buyer</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="buyerType"
                      value="existing"
                      checked={buyerType === 'existing'}
                      onChange={() => {
                        setBuyerType('existing')
                        setBuyerCompany('')
                        setBuyerContact('')
                        setBuyerEmail('')
                        setBuyerPhone('')
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Select Existing Buyer (from past deals)</span>
                  </label>
                </div>
              </div>

              {/* Conditional rendering based on buyer type */}
              {buyerType === 'new' ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input
                      placeholder="Apex Commodities Ltd"
                      value={buyerCompany}
                      onChange={(e) => setBuyerCompany(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contact Name *</Label>
                    <Input
                      placeholder="John Smith"
                      value={buyerContact}
                      onChange={(e) => setBuyerContact(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contact Email *</Label>
                    <Input
                      type="email"
                      placeholder="john@apexcommodities.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contact Phone (optional)</Label>
                    <Input
                      type="tel"
                      placeholder="+1 555 123 4567"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Select Buyer Company *</Label>
                  {existingBuyers.length > 0 ? (
                    <Select value={selectedBuyerId} onValueChange={setSelectedBuyerId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a company from past deals" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingBuyers.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name} ({company.country})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-slate-500 p-4 bg-slate-50 dark:bg-slate-800 rounded">
                      No existing buyers found. You haven't worked with any buyers yet.
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit">Next: Add Seller</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Add Seller */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Add Seller</CardTitle>
            <CardDescription>Who is selling the commodity?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStep3} className="space-y-4">
              {/* Radio button selection */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sellerType"
                      value="new"
                      checked={sellerType === 'new'}
                      onChange={() => {
                        setSellerType('new')
                        setSelectedSellerId('')
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Invite New Seller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sellerType"
                      value="existing"
                      checked={sellerType === 'existing'}
                      onChange={() => {
                        setSellerType('existing')
                        setSellerCompany('')
                        setSellerContact('')
                        setSellerEmail('')
                        setSellerPhone('')
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Select Existing Seller (from past deals)</span>
                  </label>
                </div>
              </div>

              {/* Conditional rendering based on seller type */}
              {sellerType === 'new' ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input
                      placeholder="Vitol Trading"
                      value={sellerCompany}
                      onChange={(e) => setSellerCompany(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contact Name *</Label>
                    <Input
                      placeholder="Jane Doe"
                      value={sellerContact}
                      onChange={(e) => setSellerContact(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contact Email *</Label>
                    <Input
                      type="email"
                      placeholder="jane@vitol.com"
                      value={sellerEmail}
                      onChange={(e) => setSellerEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contact Phone (optional)</Label>
                    <Input
                      type="tel"
                      placeholder="+44 20 1234 5678"
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Select Seller Company *</Label>
                  {existingSellers.length > 0 ? (
                    <Select value={selectedSellerId} onValueChange={setSelectedSellerId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a company from past deals" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingSellers.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name} ({company.country})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-slate-500 p-4 bg-slate-50 dark:bg-slate-800 rounded">
                      No existing sellers found. You haven't worked with any sellers yet.
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit">Next: Commission</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Commission */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Commission Terms (IMFPA)</CardTitle>
            <CardDescription>Set your commission structure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Commission Type</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">How your commission will be calculated from this deal.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={commissionType} onValueChange={setCommissionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMISSION_TYPES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-between w-full gap-2">
                                  <span>{c.label}</span>
                                  <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 flex-shrink-0" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-sm">
                                <p className="text-xs">{c.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Commission Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={commissionType === 'PERCENTAGE' ? '0.5' : '10000'}
                    value={commissionAmount}
                    onChange={(e) => setCommissionAmount(e.target.value)}
                  />
                  <p className="text-xs text-slate-500">
                    {commissionType === 'PERCENTAGE' && 'Enter percentage (e.g., 0.5 for 0.5%)'}
                    {commissionType === 'FIXED' && 'Enter fixed amount in USD'}
                    {commissionType === 'PER_UNIT' && 'Enter amount per MT/BBL'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating Deal...' : 'Create Deal'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
