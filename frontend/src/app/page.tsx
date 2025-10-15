'use client';

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
  const plan = user?.publicMetadata?.plan || 'free';

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
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 3rem',
        borderBottom: '1px solid #e5e7eb',
        background: 'white'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
          📄 DocuFlow AI
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <SignedOut>
            <SignInButton mode="modal">
              <button style={{
                padding: '0.5rem 1.5rem',
                background: 'transparent',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#475569',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}>
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button style={{
                padding: '0.5rem 1.5rem',
                background: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}>
                Get Started Free
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            {plan === 'free' && (
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: isUpgrading ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  opacity: isUpgrading ? 0.6 : 1
                }}
              >
                {isUpgrading ? 'Loading...' : '⚡ Upgrade to Pro'}
              </button>
            )}
            <Link href="/dashboard" style={{
              color: '#475569',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              background: '#f1f5f9',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '500'
            }}>
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '6rem 2rem 4rem 2rem',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          background: '#eff6ff',
          color: '#3b82f6',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '1.5rem'
        }}>
          ✨ AI-Powered Document Processing
        </div>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: '800',
          marginBottom: '1.5rem',
          lineHeight: '1.1',
          color: '#0f172a',
          letterSpacing: '-0.02em'
        }}>
          Transform Documents<br />into Actionable Data
        </h1>
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '3rem',
          color: '#64748b',
          lineHeight: '1.8',
          maxWidth: '700px',
          margin: '0 auto 3rem auto'
        }}>
          Upload any document, extract data with AI, and automatically sync to Google Sheets.
          PDFs, invoices, receipts, contracts — we handle it all.
        </p>
        <SignedOut>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
            <SignUpButton mode="modal">
              <button style={{
                padding: '1rem 2.5rem',
                fontSize: '1.1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.2s'
              }}>
                Start Free Trial
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button style={{
                padding: '1rem 2.5rem',
                fontSize: '1.1rem',
                background: 'transparent',
                color: '#475569',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}>
                Sign In
              </button>
            </SignInButton>
          </div>
          <p style={{ marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.95rem' }}>
            5 free documents • No credit card required • Cancel anytime
          </p>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <button style={{
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '700',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
            }}>
              Go to Dashboard →
            </button>
          </Link>
        </SignedIn>
      </div>

      {/* Features Section */}
      <div style={{
        background: '#f8fafc',
        padding: '6rem 2rem',
        marginTop: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#0f172a'
            }}>
              Everything you need to process documents
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
              Powerful features that save you hours of manual work
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {/* Feature 1 */}
            <div style={{
              padding: '2.5rem',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              transition: 'all 0.3s'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                marginBottom: '1.5rem'
              }}>
                🤖
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#1e293b', fontWeight: '600' }}>
                AI-Powered Extraction
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '1rem' }}>
                Advanced AI automatically identifies and extracts fields from any document type with high accuracy
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              padding: '2.5rem',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              transition: 'all 0.3s'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                marginBottom: '1.5rem'
              }}>
                📊
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#1e293b', fontWeight: '600' }}>
                Google Sheets Integration
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '1rem' }}>
                Extracted data automatically syncs to your Google Sheets in real-time for instant analysis
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              padding: '2.5rem',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              transition: 'all 0.3s'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                marginBottom: '1.5rem'
              }}>
                ⚡
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#1e293b', fontWeight: '600' }}>
                Lightning Fast Processing
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '1rem' }}>
                Process hundreds of documents in seconds with our optimized AI pipeline
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div style={{
        padding: '6rem 2rem',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#0f172a'
            }}>
              Simple, transparent pricing
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
              Start free, upgrade when you need more
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {/* Free Tier */}
            <div style={{
              padding: '3rem',
              background: 'white',
              borderRadius: '20px',
              border: '2px solid #e2e8f0',
              position: 'relative'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#475569', fontWeight: '600' }}>Free</h3>
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: '800', color: '#0f172a' }}>$0</span>
                <span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: '500' }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                <li style={{ marginBottom: '1rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#3b82f6' }}>✓</span> 5 documents/month
                </li>
                <li style={{ marginBottom: '1rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#3b82f6' }}>✓</span> AI extraction
                </li>
                <li style={{ marginBottom: '1rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#3b82f6' }}>✓</span> Google Sheets export
                </li>
                <li style={{ marginBottom: '1rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#cbd5e1' }}>✗</span> Priority support
                </li>
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button style={{
                    width: '100%',
                    padding: '1rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}>
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                {plan === 'free' && (
                  <Link href="/dashboard">
                    <button style={{
                      width: '100%',
                      padding: '1rem',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      Current Plan
                    </button>
                  </Link>
                )}
              </SignedIn>
            </div>

            {/* Pro Tier */}
            <div style={{
              padding: '3rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '20px',
              border: '2px solid #3b82f6',
              color: 'white',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#fbbf24',
                color: '#78350f',
                padding: '0.35rem 1.25rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '700',
                letterSpacing: '0.05em'
              }}>
                MOST POPULAR
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>Pro</h3>
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: '800' }}>$29</span>
                <span style={{ fontSize: '1.1rem', opacity: 0.9, fontWeight: '500' }}>/month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>✓</span> Unlimited documents
                </li>
                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>✓</span> AI extraction
                </li>
                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>✓</span> Google Sheets sync
                </li>
                <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>✓</span> Priority support
                </li>
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'white',
                    color: '#3b82f6',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '1rem'
                  }}>
                    Start Free Trial
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                {plan === 'free' ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'white',
                      color: '#3b82f6',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: isUpgrading ? 'not-allowed' : 'pointer',
                      fontWeight: '700',
                      fontSize: '1rem',
                      opacity: isUpgrading ? 0.6 : 1
                    }}
                  >
                    {isUpgrading ? 'Loading...' : 'Upgrade Now'}
                  </button>
                ) : (
                  <button style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '2px solid white',
                    borderRadius: '10px',
                    cursor: 'default',
                    fontWeight: '700',
                    fontSize: '1rem'
                  }}>
                    ✓ Current Plan
                  </button>
                )}
              </SignedIn>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{
        background: '#f8fafc',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: '#0f172a'
          }}>
            Ready to get started?
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Join hundreds of teams processing thousands of documents every day
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <button style={{
                padding: '1rem 2.5rem',
                fontSize: '1.1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
              }}>
                Start Free Trial
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            {plan === 'free' ? (
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                style={{
                  padding: '1rem 2.5rem',
                  fontSize: '1.1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: isUpgrading ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                  opacity: isUpgrading ? 0.6 : 1
                }}
              >
                {isUpgrading ? 'Loading...' : 'Upgrade to Pro'}
              </button>
            ) : (
              <Link href="/dashboard">
                <button style={{
                  padding: '1rem 2.5rem',
                  fontSize: '1.1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
                }}>
                  Go to Dashboard
                </button>
              </Link>
            )}
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
