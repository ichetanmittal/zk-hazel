import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Hazel Trade
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Zero-Knowledge Commodity Trading Platform
          </p>
          <p className="mt-4 text-slate-500 dark:text-slate-500 max-w-3xl mx-auto">
            Solving the trust deadlock in commodity trading with ZK verification.
            Prove you have funds or product without exposing sensitive details.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Select Your Role
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Buyer Card */}
            <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-500">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <CardTitle>Buyer</CardTitle>
                <CardDescription>
                  I want to buy commodity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Upload Proof of Funds
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    ZK verified without exposing bank details
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Access Data Room after match
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Track deal progress
                  </li>
                </ul>
                <Link href="/auth/signup?role=buyer" className="block">
                  <Button className="w-full" variant="default">
                    Get Started as Buyer
                  </Button>
                </Link>
                <Link href="/auth/login?role=buyer" className="block mt-2">
                  <Button className="w-full" variant="outline">
                    Login as Buyer
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Seller Card */}
            <Card className="hover:shadow-lg transition-shadow border-2 hover:border-green-500">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🛢️</span>
                </div>
                <CardTitle>Seller</CardTitle>
                <CardDescription>
                  I have product to sell
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Upload Proof of Product
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Tank location stays private
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Access Data Room after match
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Secure deal workflow
                  </li>
                </ul>
                <Link href="/auth/signup?role=seller" className="block">
                  <Button className="w-full" variant="default">
                    Get Started as Seller
                  </Button>
                </Link>
                <Link href="/auth/login?role=seller" className="block mt-2">
                  <Button className="w-full" variant="outline">
                    Login as Seller
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Broker Card */}
            <Card className="hover:shadow-lg transition-shadow border-2 hover:border-purple-500">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤝</span>
                </div>
                <CardTitle>Broker</CardTitle>
                <CardDescription>
                  I connect buyers & sellers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Create and manage deals
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Invite buyers and sellers
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Monitor verification status
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Track commission (IMFPA)
                  </li>
                </ul>
                <Link href="/auth/signup?role=broker" className="block">
                  <Button className="w-full" variant="default">
                    Get Started as Broker
                  </Button>
                </Link>
                <Link href="/auth/login?role=broker" className="block mt-2">
                  <Button className="w-full" variant="outline">
                    Login as Broker
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* How It Works Section */}
          <div className="mt-16 bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-center mb-8">
              How It Works
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    1
                  </span>
                </div>
                <h3 className="font-semibold mb-2">Broker Creates Deal</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Broker introduces buyer and seller, creates deal on platform
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    2
                  </span>
                </div>
                <h3 className="font-semibold mb-2">ZK Verification</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Buyer uploads POF, Seller uploads POP - both ZK verified
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    3
                  </span>
                </div>
                <h3 className="font-semibold mb-2">Match & Data Room</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  When both verified, Data Room unlocks with full documentation
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    4
                  </span>
                </div>
                <h3 className="font-semibold mb-2">12-Step Workflow</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Complete the standardized trading process to close the deal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
