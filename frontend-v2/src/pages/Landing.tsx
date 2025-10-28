import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

interface Tier {
  id: string;
  name: string;
  price: number;
  limit: number | 'unlimited';
  hasPriceId: boolean;
}

// Tier styling configuration for landing page
const TIER_STYLES: Record<string, {
  containerClass: string;
  textColor: string;
  checkColor: string;
  buttonClass: string;
  buttonText: string;
  highlighted: boolean;
}> = {
  free: {
    containerClass: 'p-8 bg-white rounded-3xl border-2 border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all',
    textColor: 'text-slate-700',
    checkColor: 'text-green-500',
    buttonClass: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    buttonText: 'text-slate-600',
    highlighted: false
  },
  developer: {
    containerClass: 'relative p-8 bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700 rounded-3xl text-white shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all',
    textColor: 'text-white',
    checkColor: 'text-white',
    buttonClass: 'bg-white text-cyan-600 hover:bg-cyan-50',
    buttonText: 'text-cyan-600',
    highlighted: true
  }
};

// Helper to get tier features based on limit
const getTierFeatures = (tier: Tier): string[] => {
  const features: string[] = [];

  if (tier.limit === 'unlimited') {
    features.push('Unlimited documents');
  } else {
    features.push(`${tier.limit} documents/month`);
  }

  if (tier.id === 'free') {
    features.push('free');
    features.push('api');
    features.push('money');
  } else if (tier.id === 'developer') {
    features.push('unlimited');
    features.push('awesome');
  }

  return features;
};

// Demo Instructions Component - Compact box, easy to remove when customizing
const DemoInstructions = () => (
  <div className="max-w-2xl mx-auto mb-8 bg-blue-50 border border-blue-300 rounded-lg p-4 shadow-sm">
    <p className="text-slate-700 text-sm text-center">
      <strong className="text-blue-600">🎯 Try this demo:</strong> Sign up → Upgrade with test card <code className="bg-slate-800 text-green-400 px-1.5 py-0.5 rounded font-mono text-xs">4242 4242 4242 4242</code> → Test usage tracking
    </p>
  </div>
);

export default function Landing() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [tiers, setTiers] = useState<Tier[]>([]);

  const plan = (user?.publicMetadata?.plan as string) || 'free';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

  useEffect(() => {
    // Fetch available tiers from API
    const fetchTiers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tiers`);
        const data = await response.json();
        setTiers(data.tiers || []);
      } catch (err) {
        console.error('Failed to fetch tiers:', err);
      }
    };

    fetchTiers();
  }, [API_URL]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          [Your Logo Here]
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
                onClick={() => navigate('/choose-plan')}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 border-none rounded-lg text-white text-sm font-semibold hover:shadow-lg transition-all cursor-pointer"
              >
                Upgrade Plan
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
          {/* Try It Now Badge */}
          <div className="inline-flex flex-col items-center gap-3 mb-8">
            <button
              onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-400 to-emerald-500 text-slate-900 rounded-full text-sm font-bold shadow-xl animate-bounce hover:scale-105 transition-transform cursor-pointer border-none"
            >
              <span className="text-lg">👉</span>
              THIS IS A WORKING DEMO - TRY IT NOW
              <span className="text-lg">👈</span>
            </button>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-sm font-semibold">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              SaaS Infrastructure Template • Auth + Billing + Usage Tracking
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-white tracking-tight">
            [Your Product Name]<br />
            <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              Drop Your App Here
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed max-w-3xl mx-auto">
            <strong>This is a live template.</strong> Replace this text with your product pitch. We handle auth, billing, usage tracking, and tier management. You bring your API—we wrap it in infrastructure. Deploy in hours, not weeks.
          </p>

          {/* Prominent Template Callout */}
          <div className="max-w-4xl mx-auto mb-12 bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl p-8 shadow-2xl">
            <div className="text-yellow-300 text-sm font-bold uppercase tracking-wider mb-3 flex items-center justify-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>This Entire Site Is The Template You Get</span>
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-white text-lg md:text-xl font-semibold leading-relaxed mb-4">
              Auth works. Billing works. Tiers work. Replace the hero text, add your product logic, deploy. <strong>That's it.</strong>
            </p>
            <p className="text-blue-100 text-base md:text-lg leading-relaxed">
              Everything's wired up and ready. Sign up for the platforms (free tiers), follow the guides to get your keys, configure the template, and launch. The infrastructure is done—you just bring your product.
            </p>
          </div>

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
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 md:px-8 py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              We Handle The Boring Infrastructure
            </h2>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
              <strong>You build features.</strong> We provide auth, billing, usage tracking, and deployment. $0 until you're making money.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Auth */}
            <div className="group p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-2xl hover:border-purple-300 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                🔐
              </div>
              <h3 className="text-2xl mb-3 text-slate-900 font-bold">
                Complete Authentication
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Sign up, login, password reset with Clerk. JWT verification on every request. Zero database lookups. <strong className="text-purple-600">Auth UI included—customize the frontend with Claude Code.</strong>
              </p>
            </div>

            {/* Feature 2 - Billing */}
            <div className="group p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-2xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                💳
              </div>
              <h3 className="text-2xl mb-3 text-slate-900 font-bold">
                Stripe Billing Ready
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Checkout, webhooks, customer portal all wired up. Users manage their own subscriptions. <strong className="text-blue-600">Billing dashboard included—modify pricing pages easily.</strong>
              </p>
            </div>

            {/* Feature 3 - Usage Tracking */}
            <div className="group p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-2xl hover:border-green-300 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                📊
              </div>
              <h3 className="text-2xl mb-3 text-slate-900 font-bold">
                Usage Limits Enforced
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Per-tier request limits with monthly resets. Automatic tracking. Users see their quota in real-time. <strong className="text-green-600">Usage dashboard fully styled—just add your branding.</strong>
              </p>
            </div>

            {/* Feature 4 - Edge Deploy */}
            <div className="group p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-2xl hover:border-orange-300 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <h3 className="text-2xl mb-3 text-slate-900 font-bold">
                Global Edge (Zero Cold Starts)
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Runs in 300+ cities. ~50ms response times worldwide. No Lambda spin-up delays.
              </p>
            </div>

            {/* Feature 5 - AI Config */}
            <div className="group p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-2xl hover:border-pink-300 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h3 className="text-2xl mb-3 text-slate-900 font-bold">
                AI Tier Configurator
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Answer questions in natural language. AI updates backend limits, frontend cards, Stripe integration automatically. <strong className="text-pink-600">Configure pricing tiers without touching code.</strong>
              </p>
            </div>

            {/* Feature 6 - Cost */}
            <div className="group p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-2xl hover:border-red-300 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                💰
              </div>
              <h3 className="text-2xl mb-3 text-slate-900 font-bold">
                $0 Until You're Making Money
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Free until 10k users. Then ~$31/month. At 100k users: ~$109/month. Compare that to $150+/month from day one. <strong className="text-red-600">Template is free—deploy multiple projects with it.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing-section" className="px-6 md:px-8 py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Example Pricing Tiers (AI Customizable)
            </h2>
            <p className="text-slate-600 text-lg md:text-xl">
              <strong>These tiers are just examples.</strong> Configure your own with <code>/configure-tiers</code> command. AI updates everything automatically.
            </p>
          </div>

          {/* Demo Instructions - Feel free to move or style this */}
          <DemoInstructions />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Dynamic Tier Cards */}
            {tiers.map((tier) => {
              const style = TIER_STYLES[tier.id] || TIER_STYLES.free;
              const features = getTierFeatures(tier);
              const isCurrent = plan === tier.id;
              const isFree = tier.id === 'free';

              return (
                <div key={tier.id} className={style.containerClass}>
                  {/* Popular Badge */}
                  {style.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg">
                      Popular
                    </div>
                  )}

                  {/* Tier Header */}
                  <div className="text-center mb-6">
                    <h3 className={`text-xl mb-2 font-bold ${style.textColor}`}>
                      {tier.name}
                    </h3>
                    <div className="mb-3">
                      <span className={`text-5xl font-extrabold ${style.textColor}`}>
                        ${tier.price}
                      </span>
                      <span className={`text-lg font-medium ${style.textColor === 'text-white' ? 'opacity-90' : 'text-slate-600'}`}>
                        /month
                      </span>
                    </div>
                    <p className={`text-sm ${style.textColor === 'text-white' ? 'opacity-90' : 'text-slate-600'}`}>
                      {isFree ? 'Perfect for trying out' : 'For power users'}
                    </p>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-6">
                    {features.map((feature, idx) => (
                      <li key={idx} className={`flex items-start gap-2 text-sm ${style.textColor}`}>
                        <span className={`${style.checkColor} text-lg flex-shrink-0`}>✓</span>
                        <span className={style.textColor === 'text-white' ? 'font-medium' : ''}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Buttons */}
                  <SignedOut>
                    <button
                      onClick={() => navigate('/sign-up')}
                      className={`w-full px-4 py-3 border-none rounded-xl cursor-pointer font-bold text-sm shadow-xl transition-all ${style.buttonClass}`}
                    >
                      {isFree ? 'Get Started Free' : 'Get Started'}
                    </button>
                  </SignedOut>
                  <SignedIn>
                    {isCurrent ? (
                      <button className={`w-full px-4 py-3 rounded-xl cursor-default font-bold text-sm ${
                        style.textColor === 'text-white'
                          ? 'bg-white/20 text-white border-2 border-white'
                          : `bg-slate-100 ${style.textColor} border-none`
                      }`}>
                        ✓ Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/choose-plan')}
                        className={`w-full px-4 py-3 border-none rounded-xl font-bold text-sm shadow-xl transition-all cursor-pointer ${style.buttonClass}`}
                      >
                        Select Plan
                      </button>
                    )}
                  </SignedIn>
                </div>
              );
            })}
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
                onClick={() => navigate('/choose-plan')}
                className="px-12 py-6 text-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all cursor-pointer"
              >
                View Plans
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
          <p className="text-slate-400 text-sm mb-4">
            <strong className="text-slate-200">This is a LIVE TEMPLATE Demo</strong>
          </p>
          <p className="text-slate-300 text-sm mb-4 max-w-3xl mx-auto">
            This entire site is the template you get. Auth works, billing works, tiers work. Replace the hero text, add your product logic, deploy. That's it.
          </p>
          <p className="text-slate-400 text-xs mb-2">
            Built with the <span className="font-semibold text-slate-200">Production SaaS Infrastructure Template</span>
          </p>
          <p className="text-slate-500 text-xs">
            React 19 • TypeScript • Cloudflare Workers • Clerk Auth • Stripe • Tailwind CSS • CI/CD Included
          </p>
        </div>
      </div>
    </div>
  );
}
