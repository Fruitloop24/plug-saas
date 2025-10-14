'use client';

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 3rem',
        color: 'white'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          📄 DocuFlow AI
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <SignedOut>
            <SignInButton mode="modal">
              <button style={{
                padding: '0.5rem 1.5rem',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid white',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button style={{
                padding: '0.5rem 1.5rem',
                background: 'white',
                border: 'none',
                borderRadius: '6px',
                color: '#667eea',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" style={{
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '6px'
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
        padding: '6rem 2rem',
        color: 'white',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          marginBottom: '1.5rem',
          lineHeight: '1.2'
        }}>
          AI-Powered Document Processing
        </h1>
        <p style={{
          fontSize: '1.3rem',
          marginBottom: '3rem',
          opacity: 0.95,
          lineHeight: '1.6'
        }}>
          Upload any document, extract data with AI, and automatically sync to Google Sheets.
          PDFs, invoices, receipts, contracts — we handle it all.
        </p>
        <SignedOut>
          <SignUpButton mode="modal">
            <button style={{
              padding: '1rem 3rem',
              fontSize: '1.2rem',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s'
            }}>
              Start Free Trial
            </button>
          </SignUpButton>
          <p style={{ marginTop: '1rem', opacity: 0.9 }}>5 free documents • No credit card required</p>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <button style={{
              padding: '1rem 3rem',
              fontSize: '1.2rem',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              Go to Dashboard
            </button>
          </Link>
        </SignedIn>
      </div>

      {/* Features Section */}
      <div style={{
        background: 'white',
        padding: '5rem 2rem',
        marginTop: '3rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '4rem',
            color: '#333'
          }}>
            Powerful Features
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {/* Feature 1 */}
            <div style={{
              padding: '2rem',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#667eea' }}>
                AI Extraction
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Advanced AI automatically identifies and extracts fields from any document type
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              padding: '2rem',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#667eea' }}>
                Google Sheets Sync
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Extracted data automatically syncs to your Google Sheets in real-time
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              padding: '2rem',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#667eea' }}>
                Smart Categorization
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Documents are automatically categorized and organized for easy retrieval
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div style={{
        background: '#f8f9fa',
        padding: '5rem 2rem'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '3rem',
            color: '#333'
          }}>
            Simple Pricing
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* Free Tier */}
            <div style={{
              padding: '2.5rem',
              background: 'white',
              borderRadius: '12px',
              border: '2px solid #e0e0e0'
            }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#667eea' }}>Free</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#333' }}>
                $0<span style={{ fontSize: '1rem', fontWeight: '400' }}>/month</span>
              </div>
              <p style={{ color: '#666', marginBottom: '2rem' }}>Perfect for testing</p>
              <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0, color: '#666' }}>
                <li style={{ marginBottom: '0.75rem' }}>✓ 5 documents/month</li>
                <li style={{ marginBottom: '0.75rem' }}>✓ AI extraction</li>
                <li style={{ marginBottom: '0.75rem' }}>✓ Google Sheets export</li>
              </ul>
            </div>

            {/* Pro Tier */}
            <div style={{
              padding: '2.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              border: '2px solid #667eea',
              color: 'white',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '20px',
                background: '#ffd700',
                color: '#333',
                padding: '0.25rem 1rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '700'
              }}>
                POPULAR
              </div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Pro</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                $29<span style={{ fontSize: '1rem', fontWeight: '400' }}>/month</span>
              </div>
              <p style={{ marginBottom: '2rem', opacity: 0.95 }}>For professionals</p>
              <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.75rem' }}>✓ Unlimited documents</li>
                <li style={{ marginBottom: '0.75rem' }}>✓ AI extraction</li>
                <li style={{ marginBottom: '0.75rem' }}>✓ Google Sheets sync</li>
                <li style={{ marginBottom: '0.75rem' }}>✓ Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}