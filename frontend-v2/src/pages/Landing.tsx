import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { useState } from 'react';

export default function Landing() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
  const plan = (user?.publicMetadata?.plan as string) || 'free';

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const token = await getToken({ template: 'pan-api' });
      const response = await fetch(`${API_URL}/api/create-checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
        setIsUpgrading(false);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade process');
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Panacea Tech
        </div>
        <div className="flex gap-4 items-center">
          <SignedOut>
            <button
              onClick={() => navigate('/sign-in')}
              className="px-6 py-2 bg-transparent border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer text-sm font-medium transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/sign-up')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 border-none rounded-lg text-white hover:shadow-lg hover:shadow-purple-500/30 cursor-pointer text-sm font-semibold transition-all"
            >
              Get Started Free
            </button>
          </SignedOut>
          <SignedIn>
            {plan === 'free' && (
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 border-none rounded-lg text-white text-sm font-semibold hover:shadow-lg transition-all ${
                  isUpgrading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                {isUpgrading ? 'Loading...' : 'Upgrade to Pro'}
              </button>
            )}
            <Link to="/dashboard" className="text-slate-700 no-underline px-4 py-2 hover:bg-slate-100 rounded-lg text-sm font-medium transition-all">
              Dashboard
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 opacity-95"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bS00IDB2Mmgydi0yaC0yem0wLTRoMnYtMmgtMnYyem0tMiAydjJoMnYtMmgtMnptMC00aDJ2LTJoLTJ2MnptLTIgMHYyaDJ2LTJoLTJ6bTAtNGgydi0yaC0ydjJ6bS0yIDJ2Mmgydi0yaC0yem0wLTRoMnYtMmgtMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

        <div className="relative text-center px-6 md:px-8 py-20 md:py-32 max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-sm font-semibold mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Production SaaS Starter Template
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-white tracking-tight">
            Launch Your SaaS in<br />
            <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              Hours, Not Months
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-blue-100 leading-relaxed max-w-3xl mx-auto">
            Complete production-ready starter with Clerk authentication, Stripe billing,
            Cloudflare Workers edge deployment, and enterprise security. Stop building boilerplate, start shipping features.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <SignedOut>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-10 py-5 text-lg bg-white text-blue-600 border-none rounded-xl cursor-pointer font-bold shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all"
              >
                View Demo
              </button>
              <button
                onClick={() => navigate('/sign-up')}
                className="px-10 py-5 text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none rounded-xl cursor-pointer font-bold shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all"
              >
                Get Started Free
              </button>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <button className="px-10 py-5 text-lg bg-white text-blue-600 border-none rounded-xl cursor-pointer font-bold shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all">
                  Go to Dashboard
                </button>
              </Link>
            </SignedIn>
          </div>

          {/* Code Preview Snippet */}
          <div className="max-w-3xl mx-auto mt-16 bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-slate-400 text-sm ml-4">Quick Start</span>
            </div>
            <pre className="text-left text-sm md:text-base">
              <code className="text-green-400">
                <span className="text-purple-400">import</span> <span className="text-blue-300">{'{ SignedIn, SignedOut }'}</span> <span className="text-purple-400">from</span> <span className="text-orange-300">'@clerk/clerk-react'</span>;{'\n'}
                <span className="text-purple-400">import</span> <span className="text-blue-300">{'{ createCheckout }'}</span> <span className="text-purple-400">from</span> <span className="text-orange-300">'./api'</span>;{'\n\n'}
                <span className="text-slate-500">// Authentication built-in</span>{'\n'}
                <span className="text-blue-300">{'<SignedIn>'}</span>{'\n'}
                {'  '}<span className="text-green-300">{'<Dashboard />'}</span>{'\n'}
                <span className="text-blue-300">{'</SignedIn>'}</span>{'\n\n'}
                <span className="text-slate-500">// Stripe billing ready</span>{'\n'}
                <span className="text-purple-400">const</span> <span className="text-blue-300">checkout</span> = <span className="text-purple-400">await</span> <span className="text-yellow-300">createCheckout</span>();
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Tech Stack Badges */}
      <div className="py-16 px-6 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-slate-600 text-sm font-semibold uppercase tracking-wider mb-8">
            Built for developers who ship fast
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            <div className="px-6 py-3 bg-slate-50 rounded-lg border border-slate-200 font-semibold text-slate-700 text-sm">
              React 19
            </div>
            <div className="px-6 py-3 bg-slate-50 rounded-lg border border-slate-200 font-semibold text-slate-700 text-sm">
              TypeScript
            </div>
            <div className="px-6 py-3 bg-orange-50 rounded-lg border border-orange-200 font-semibold text-orange-700 text-sm">
              Cloudflare Workers
            </div>
            <div className="px-6 py-3 bg-purple-50 rounded-lg border border-purple-200 font-semibold text-purple-700 text-sm">
              Clerk Auth
            </div>
            <div className="px-6 py-3 bg-blue-50 rounded-lg border border-blue-200 font-semibold text-blue-700 text-sm">
              Stripe
            </div>
            <div className="px-6 py-3 bg-slate-50 rounded-lg border border-slate-200 font-semibold text-slate-700 text-sm">
              Tailwind CSS
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 md:px-8 py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Everything You Need to Launch
            </h2>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
              Production-ready features that would take weeks to build from scratch
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Authentication */}
            <div className="group p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-2xl hover:border-purple-300 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                🔐
              </div>
              <h3 className="text-2xl mb-3 text-slate-900 font-bold">
                Clerk Authentication
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Complete auth system with social logins, magic links, MFA, and user management out of the box
              </p>
            </div>

            {/* Feature 2 - Billing */}
            <div className="group p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-2xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                💳
              </div>
              <h3 className="text-2xl mb-3 text-slate-900 font-bold">
                Stripe Billing
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Subscriptions, usage-based billing, webhooks, and customer portal fully integrated and tested
              </p>
            </div>

            {/* Feature 3 - Edge Deployment */}
            <div className="group p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-2xl hover:border-orange-300 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <h3 className="text-2xl mb-3 text-slate-900 font-bold">
                Edge Deployment
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Cloudflare Workers for global low-latency API with zero cold starts and automatic scaling
              </p>
            </div>

            {/* Feature 4 - Usage Tracking */}
            <div className="group p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-2xl hover:border-green-300 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                📊
              </div>
              <h3 className="text-2xl mb-3 text-slate-900 font-bold">
                Usage Tracking
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Built-in usage metering and quota enforcement with real-time updates synced to user metadata
              </p>
            </div>

            {/* Feature 5 - Webhooks */}
            <div className="group p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-2xl hover:border-pink-300 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                🔔
              </div>
              <h3 className="text-2xl mb-3 text-slate-900 font-bold">
                Webhook Handlers
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Stripe and Clerk webhook processors with signature verification, retry logic, and idempotency
              </p>
            </div>

            {/* Feature 6 - Security */}
            <div className="group p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-2xl hover:border-red-300 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                🛡️
              </div>
              <h3 className="text-2xl mb-3 text-slate-900 font-bold">
                Security Headers
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Enterprise-grade security with CORS, CSP, rate limiting, and comprehensive security headers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Example Section */}
      <div className="px-6 md:px-8 py-24 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Simple, Clean API
            </h2>
            <p className="text-slate-400 text-lg md:text-xl">
              Everything is pre-configured and ready to customize
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Auth Example */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
              <h4 className="text-green-400 font-semibold mb-4 text-sm uppercase tracking-wider">Protected Routes</h4>
              <pre className="text-sm overflow-x-auto">
                <code className="text-slate-300">
                  <span className="text-purple-400">const</span> <span className="text-blue-300">Dashboard</span> = () {'=> {'}{'\n'}
                  {'  '}<span className="text-purple-400">const</span> {'{ user }'} = <span className="text-yellow-300">useUser</span>();{'\n'}
                  {'  '}<span className="text-purple-400">const</span> plan = user<span className="text-pink-400">?.</span>publicMetadata<span className="text-pink-400">?.</span>plan;{'\n\n'}
                  {'  '}<span className="text-purple-400">return</span> ({'\n'}
                  {'    '}<span className="text-blue-300">{'<div>'}</span>{'\n'}
                  {'      '}<span className="text-slate-500">// Your dashboard code</span>{'\n'}
                  {'    '}<span className="text-blue-300">{'</div>'}</span>{'\n'}
                  {'  '});{'\n'}
                  {'}'};
                </code>
              </pre>
            </div>

            {/* Stripe Example */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
              <h4 className="text-green-400 font-semibold mb-4 text-sm uppercase tracking-wider">Stripe Checkout</h4>
              <pre className="text-sm overflow-x-auto">
                <code className="text-slate-300">
                  <span className="text-purple-400">const</span> <span className="text-yellow-300">handleUpgrade</span> = <span className="text-purple-400">async</span> () {'=> {'}{'\n'}
                  {'  '}<span className="text-purple-400">const</span> token = <span className="text-purple-400">await</span> <span className="text-yellow-300">getToken</span>();{'\n'}
                  {'  '}<span className="text-purple-400">const</span> res = <span className="text-purple-400">await</span> <span className="text-yellow-300">fetch</span>(<span className="text-orange-300">'/api/checkout'</span>, {'{'}{'\n'}
                  {'    '}headers: {'{ '}Authorization: <span className="text-orange-300">`Bearer ${'{token}'}`</span>{' },'}{'\n'}
                  {'  '}{'});'}{'\n\n'}
                  {'  '}window<span className="text-pink-400">.</span>location = data<span className="text-pink-400">.</span>url;{'\n'}
                  {'}'};
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="px-6 md:px-8 py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-600 text-lg md:text-xl">
              Try it free, upgrade when you're ready to launch
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-10 bg-white rounded-3xl border-2 border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all">
              <div className="text-center mb-8">
                <h3 className="text-2xl mb-2 text-slate-700 font-bold">Free</h3>
                <div className="mb-4">
                  <span className="text-6xl font-extrabold text-slate-900">$0</span>
                  <span className="text-xl text-slate-600 font-medium">/month</span>
                </div>
                <p className="text-slate-600">Perfect for testing and development</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-slate-700">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span>5 API requests/month</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span>Full authentication system</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                  <span>Usage tracking & quotas</span>
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                  <span className="text-slate-300 text-xl flex-shrink-0">✗</span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-3 text-slate-400">
                  <span className="text-slate-300 text-xl flex-shrink-0">✗</span>
                  <span>Custom branding</span>
                </li>
              </ul>
              <SignedOut>
                <button
                  onClick={() => navigate('/sign-up')}
                  className="w-full px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded-xl cursor-pointer font-bold text-base transition-all"
                >
                  Get Started Free
                </button>
              </SignedOut>
              <SignedIn>
                {plan === 'free' && (
                  <Link to="/dashboard">
                    <button className="w-full px-6 py-4 bg-slate-100 text-slate-700 border-none rounded-xl cursor-pointer font-bold text-base">
                      Current Plan
                    </button>
                  </Link>
                )}
              </SignedIn>
            </div>

            {/* Pro Tier */}
            <div className="relative p-10 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-3xl text-white shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 px-6 py-2 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg">
                Most Popular
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl mb-2 font-bold">Pro</h3>
                <div className="mb-4">
                  <span className="text-6xl font-extrabold">$29</span>
                  <span className="text-xl opacity-90 font-medium">/month</span>
                </div>
                <p className="text-blue-100">For production applications</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">✓</span>
                  <span className="font-medium">Unlimited API requests</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">✓</span>
                  <span className="font-medium">All authentication features</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">✓</span>
                  <span className="font-medium">Advanced usage analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">✓</span>
                  <span className="font-medium">Priority email support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">✓</span>
                  <span className="font-medium">Remove Panacea branding</span>
                </li>
              </ul>
              <SignedOut>
                <button
                  onClick={() => navigate('/sign-up')}
                  className="w-full px-6 py-4 bg-white text-blue-600 border-none rounded-xl cursor-pointer font-bold text-base hover:bg-blue-50 shadow-xl transition-all"
                >
                  Start Free Trial
                </button>
              </SignedOut>
              <SignedIn>
                {plan === 'free' ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className={`w-full px-6 py-4 bg-white text-blue-600 border-none rounded-xl font-bold text-base shadow-xl transition-all ${
                      isUpgrading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-blue-50'
                    }`}
                  >
                    {isUpgrading ? 'Loading...' : 'Upgrade to Pro'}
                  </button>
                ) : (
                  <button className="w-full px-6 py-4 bg-white/20 text-white border-2 border-white rounded-xl cursor-default font-bold text-base">
                    ✓ Current Plan
                  </button>
                )}
              </SignedIn>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 px-6 md:px-8 py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bS00IDB2Mmgydi0yaC0yem0wLTRoMnYtMmgtMnYyem0tMiAydjJoMnYtMmgtMnptMC00aDJ2LTJoLTJ2MnptLTIgMHYyaDJ2LTJoLTJ6bTAtNGgydi0yaC0ydjJ6bS0yIDJ2Mmgydi0yaC0yem0wLTRoMnYtMmgtMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Ready to Ship Your SaaS?
          </h2>
          <p className="text-xl md:text-2xl text-blue-200 mb-12 max-w-2xl mx-auto leading-relaxed">
            Stop wasting weeks on authentication, billing, and infrastructure.
            Start with production-ready code and ship your MVP today.
          </p>

          <SignedOut>
            <button
              onClick={() => navigate('/sign-up')}
              className="px-12 py-6 text-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none rounded-2xl cursor-pointer font-bold shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all"
            >
              Get Started Free
            </button>
            <p className="mt-6 text-blue-300 text-base">
              No credit card required • 5 free requests • Deploy in minutes
            </p>
          </SignedOut>
          <SignedIn>
            {plan === 'free' ? (
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className={`px-12 py-6 text-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all ${
                  isUpgrading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                {isUpgrading ? 'Loading...' : 'Upgrade to Pro'}
              </button>
            ) : (
              <Link to="/dashboard">
                <button className="px-12 py-6 text-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none rounded-2xl cursor-pointer font-bold shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all">
                  Go to Dashboard
                </button>
              </Link>
            )}
          </SignedIn>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 px-6 md:px-8 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400 text-sm mb-2">
            Built with the <span className="font-semibold text-slate-200">Production SaaS Starter Template</span>
          </p>
          <p className="text-slate-500 text-xs">
            React 19 • TypeScript • Cloudflare Workers • Clerk Auth • Stripe • Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}
