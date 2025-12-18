import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Zap, Lock, CheckCircle2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Hazel Trade
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup?role=broker">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Zero-Knowledge Verification
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
            Secure Commodity Trading
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Without Exposing Secrets
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            Break the trust deadlock in commodity trading. Prove you have funds or product without revealing sensitive details.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup?role=broker">
              <Button size="lg" className="gap-2">
                Start Trading
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 dark:bg-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Why Hazel Trade?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              The only platform designed specifically for secure commodity transactions
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                Privacy First
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Zero-knowledge proofs verify funds and product ownership without exposing bank details or tank locations
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                Secure Workflow
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                12-step standardized process from NCNDA to final payment ensures all parties are protected
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                Fast Matching
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Instant verification and matching. Data room unlocks automatically when both parties are verified
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-20" id="get-started">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Choose Your Role
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Get started in seconds with the role that fits you
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Buyer */}
            <div className="group relative bg-white dark:bg-slate-800 p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-xl">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl">💰</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Buyer</h3>
                <p className="text-slate-600 dark:text-slate-400">Purchase commodities securely</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Upload Proof of Funds</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">ZK verification - no bank exposure</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Access secure data room</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Track deal in real-time</span>
                </li>
              </ul>
              <div className="space-y-3">
                <Link href="/auth/signup?role=buyer" className="block">
                  <Button className="w-full" size="lg">Get Started</Button>
                </Link>
                <Link href="/auth/login?role=buyer" className="block">
                  <Button className="w-full" variant="outline" size="lg">Sign In</Button>
                </Link>
              </div>
            </div>

            {/* Seller */}
            <div className="group relative bg-white dark:bg-slate-800 p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 transition-all hover:shadow-xl">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl">🛢️</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Seller</h3>
                <p className="text-slate-600 dark:text-slate-400">Sell commodities with privacy</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Upload Proof of Product</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Tank location stays private</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Secure documentation sharing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Guaranteed payment workflow</span>
                </li>
              </ul>
              <div className="space-y-3">
                <Link href="/auth/signup?role=seller" className="block">
                  <Button className="w-full" size="lg">Get Started</Button>
                </Link>
                <Link href="/auth/login?role=seller" className="block">
                  <Button className="w-full" variant="outline" size="lg">Sign In</Button>
                </Link>
              </div>
            </div>

            {/* Broker */}
            <div className="group relative bg-white dark:bg-slate-800 p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-xl">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl">🤝</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Broker</h3>
                <p className="text-slate-600 dark:text-slate-400">Connect buyers and sellers</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Create and manage deals</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Invite buyers and sellers</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Monitor verification status</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Track IMFPA commission</span>
                </li>
              </ul>
              <div className="space-y-3">
                <Link href="/auth/signup?role=broker" className="block">
                  <Button className="w-full" size="lg">Get Started</Button>
                </Link>
                <Link href="/auth/login?role=broker" className="block">
                  <Button className="w-full" variant="outline" size="lg">Sign In</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-50 dark:bg-slate-900 py-20" id="how-it-works">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Four simple steps to secure commodity trading
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Create Deal</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Broker introduces buyer and seller, creates deal on platform with all details
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">ZK Verification</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Buyer uploads POF, Seller uploads POP - both verified without exposing secrets
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Data Room Access</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Once verified, secure data room unlocks with all deal documentation
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Complete Deal</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Follow 12-step standardized workflow from NCNDA to final payment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Hazel Trade
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Zero-Knowledge Commodity Trading
              </p>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              © 2025 Hazel Trade. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
