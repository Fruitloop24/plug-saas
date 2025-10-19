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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-12 py-6 border-b border-gray-200 bg-white">
        <div className="text-2xl font-bold text-slate-800">
          ⚡ Panacea Tech
        </div>
        <div className="flex gap-4 items-center">
          <SignedOut>
            <button
              onClick={() => navigate('/sign-in')}
              className="px-6 py-2 bg-transparent border border-slate-300 rounded-lg text-slate-600 cursor-pointer text-[15px] font-medium transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/sign-up')}
              className="px-6 py-2 bg-blue-500 border-none rounded-lg text-white cursor-pointer text-[15px] font-semibold transition-all"
            >
              Get Started Free
            </button>
          </SignedOut>
          <SignedIn>
            {plan === 'free' && (
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className={`px-6 py-2 bg-gradient-to-br from-blue-500 to-blue-600 border-none rounded-lg text-white text-[15px] font-semibold ${
                  isUpgrading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                {isUpgrading ? 'Loading...' : '⚡ Upgrade to Pro'}
              </button>
            )}
            <Link to="/dashboard" className="text-slate-600 no-underline px-4 py-2 bg-slate-100 rounded-lg text-[15px] font-medium">
              Dashboard
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="text-center px-8 py-24 pb-16 max-w-[1000px] mx-auto">
        <div className="inline-block px-4 py-2 bg-blue-50 text-blue-500 rounded-[20px] text-sm font-semibold mb-6">
          ✨ Production SaaS Starter Template
        </div>
        <h1 className="text-6xl font-extrabold mb-6 leading-tight text-slate-900 tracking-tight">
          Build Your SaaS<br />on Cloudflare Edge
        </h1>
        <p className="text-xl mb-12 text-slate-600 leading-relaxed max-w-[700px] mx-auto">
          Full-stack starter with authentication, billing, usage tracking, and webhooks. Deploy globally in minutes with zero cold starts.
        </p>
        <SignedOut>
          <div className="flex gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/sign-up')}
              className="px-10 py-4 text-lg bg-blue-500 text-white border-none rounded-xl cursor-pointer font-bold shadow-lg shadow-blue-500/40 transition-all"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/sign-in')}
              className="px-10 py-4 text-lg bg-transparent text-slate-600 border-2 border-slate-200 rounded-xl cursor-pointer font-semibold transition-all"
            >
              Sign In
            </button>
          </div>
          <p className="mt-6 text-slate-400 text-[0.95rem]">
            5 free documents • No credit card required • Cancel anytime
          </p>
        </SignedOut>
        <SignedIn>
          <Link to="/dashboard">
            <button className="px-10 py-4 text-lg bg-blue-500 text-white border-none rounded-xl cursor-pointer font-bold shadow-lg shadow-blue-500/40">
              Go to Dashboard →
            </button>
          </Link>
        </SignedIn>
      </div>

      {/* Features Section */}
      <div className="bg-slate-50 px-8 py-24 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">
              Everything you need to process documents
            </h2>
            <p className="text-slate-600 text-lg">
              Powerful features that save you hours of manual work
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8">
            {/* Feature 1 */}
            <div className="p-10 bg-white border border-slate-200 rounded-2xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-3xl mb-6">
                🤖
              </div>
              <h3 className="text-2xl mb-4 text-slate-800 font-semibold">
                AI-Powered Extraction
              </h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Advanced AI automatically identifies and extracts fields from any document type with high accuracy
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-10 bg-white border border-slate-200 rounded-2xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-3xl mb-6">
                📊
              </div>
              <h3 className="text-2xl mb-4 text-slate-800 font-semibold">
                Google Sheets Integration
              </h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Extracted data automatically syncs to your Google Sheets in real-time for instant analysis
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-10 bg-white border border-slate-200 rounded-2xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-3xl mb-6">
                ⚡
              </div>
              <h3 className="text-2xl mb-4 text-slate-800 font-semibold">
                Lightning Fast Processing
              </h3>
              <p className="text-slate-600 leading-relaxed text-base">
                Process hundreds of documents in seconds with our optimized AI pipeline
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="px-8 py-24 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-600 text-lg">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 max-w-[900px] mx-auto">
            {/* Free Tier */}
            <div className="p-12 bg-white rounded-3xl border-2 border-slate-200 relative">
              <h3 className="text-2xl mb-2 text-slate-600 font-semibold">Free</h3>
              <div className="mb-8">
                <span className="text-[3.5rem] font-extrabold text-slate-900">$0</span>
                <span className="text-lg text-slate-600 font-medium">/month</span>
              </div>
              <ul className="list-none p-0 mb-8">
                <li className="mb-4 text-slate-600 flex items-center gap-3">
                  <span className="text-blue-500">✓</span> 5 documents/month
                </li>
                <li className="mb-4 text-slate-600 flex items-center gap-3">
                  <span className="text-blue-500">✓</span> AI extraction
                </li>
                <li className="mb-4 text-slate-600 flex items-center gap-3">
                  <span className="text-blue-500">✓</span> Google Sheets export
                </li>
                <li className="mb-4 text-slate-400 flex items-center gap-3">
                  <span className="text-slate-300">✗</span> Priority support
                </li>
              </ul>
              <SignedOut>
                <button
                  onClick={() => navigate('/sign-up')}
                  className="w-full px-4 py-4 bg-slate-100 text-slate-600 border-none rounded-xl cursor-pointer font-semibold text-base"
                >
                  Get Started
                </button>
              </SignedOut>
              <SignedIn>
                {plan === 'free' && (
                  <Link to="/dashboard">
                    <button className="w-full px-4 py-4 bg-slate-100 text-slate-600 border-none rounded-xl cursor-pointer font-semibold text-base">
                      Current Plan
                    </button>
                  </Link>
                )}
              </SignedIn>
            </div>

            {/* Pro Tier */}
            <div className="p-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl border-2 border-blue-500 text-white relative shadow-2xl shadow-blue-500/30">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 px-5 py-1.5 rounded-[20px] text-xs font-bold tracking-wider">
                MOST POPULAR
              </div>
              <h3 className="text-2xl mb-2 font-semibold">Pro</h3>
              <div className="mb-8">
                <span className="text-[3.5rem] font-extrabold">$29</span>
                <span className="text-lg opacity-90 font-medium">/month</span>
              </div>
              <ul className="list-none p-0 mb-8">
                <li className="mb-4 flex items-center gap-3">
                  <span>✓</span> Unlimited documents
                </li>
                <li className="mb-4 flex items-center gap-3">
                  <span>✓</span> AI extraction
                </li>
                <li className="mb-4 flex items-center gap-3">
                  <span>✓</span> Google Sheets sync
                </li>
                <li className="mb-4 flex items-center gap-3">
                  <span>✓</span> Priority support
                </li>
              </ul>
              <SignedOut>
                <button
                  onClick={() => navigate('/sign-up')}
                  className="w-full px-4 py-4 bg-white text-blue-500 border-none rounded-xl cursor-pointer font-bold text-base"
                >
                  Start Free Trial
                </button>
              </SignedOut>
              <SignedIn>
                {plan === 'free' ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className={`w-full px-4 py-4 bg-white text-blue-500 border-none rounded-xl font-bold text-base ${
                      isUpgrading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                    }`}
                  >
                    {isUpgrading ? 'Loading...' : 'Upgrade Now'}
                  </button>
                ) : (
                  <button className="w-full px-4 py-4 bg-white/20 text-white border-2 border-white rounded-xl cursor-default font-bold text-base">
                    ✓ Current Plan
                  </button>
                )}
              </SignedIn>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-slate-50 px-8 py-16 text-center">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-slate-900">
            Ready to get started?
          </h2>
          <p className="text-slate-600 text-lg mb-8">
            Join hundreds of teams processing thousands of documents every day
          </p>
          <SignedOut>
            <button
              onClick={() => navigate('/sign-up')}
              className="px-10 py-4 text-lg bg-blue-500 text-white border-none rounded-xl cursor-pointer font-bold shadow-lg shadow-blue-500/40"
            >
              Start Free Trial
            </button>
          </SignedOut>
          <SignedIn>
            {plan === 'free' ? (
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className={`px-10 py-4 text-lg bg-blue-500 text-white border-none rounded-xl font-bold shadow-lg shadow-blue-500/40 ${
                  isUpgrading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                {isUpgrading ? 'Loading...' : 'Upgrade to Pro'}
              </button>
            ) : (
              <Link to="/dashboard">
                <button className="px-10 py-4 text-lg bg-blue-500 text-white border-none rounded-xl cursor-pointer font-bold shadow-lg shadow-blue-500/40">
                  Go to Dashboard
                </button>
              </Link>
            )}
          </SignedIn>

          {/* Template Disclaimer */}
          <div className="mt-16 pt-8 border-t border-slate-200">
            <p className="text-slate-500 text-sm">
              Built with the{' '}
              <span className="font-semibold text-slate-700">Production SaaS Starter Template</span>
              {' '}• Full-stack React + Cloudflare Workers + Clerk Auth
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
