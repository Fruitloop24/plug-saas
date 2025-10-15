'use client';

import { useAuth, useUser, useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UsageData {
	userId: string;
	plan: string;
	usageCount: number;
	limit: number | string;
	remaining: number | string;
}

interface ApiResponse {
	success: boolean;
	data?: any;
	usage?: {
		count: number;
		limit: number | string;
		plan: string;
	};
	error?: string;
	message?: string;
}

export default function Dashboard() {
	const { getToken } = useAuth();
	const { user, isLoaded } = useUser();
	const { signOut } = useClerk();
	const [usage, setUsage] = useState<UsageData | null>(null);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');

	const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

	const handleSignOut = async () => {
		await signOut({ redirectUrl: '/' });
	};

	const fetchUsage = async () => {
		try {
			const token = await getToken({ template: 'pan-api' });
			const response = await fetch(`${API_URL}/api/usage`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await response.json();
			setUsage(data);
		} catch (error) {
			console.error('Failed to fetch usage:', error);
		}
	};

	const makeRequest = async () => {
		setLoading(true);
		setMessage('');
		try {
			const token = await getToken({ template: 'pan-api' });
			const response = await fetch(`${API_URL}/api/data`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});
			const data: ApiResponse = await response.json();

			if (response.ok) {
				setMessage(`✓ Success! ${data.data?.message}`);
				await fetchUsage();
			} else {
				setMessage(`✗ ${data.error || 'Request failed'} ${data.message || ''}`);
			}
		} catch (error) {
			setMessage('✗ Failed to make request');
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleUpgrade = async () => {
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
				// Redirect to Stripe checkout
				window.location.href = data.url;
			} else {
				alert('Failed to create checkout session');
			}
		} catch (error) {
			console.error('Upgrade error:', error);
			alert('Failed to start upgrade process');
		}
	};

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const success = urlParams.get('success');

		if (success === 'true') {
			setMessage('🎉 Upgrade successful! Refreshing your account...');
			// Wait for user to be loaded, then reload to get fresh JWT with new plan
			const timer = setTimeout(() => {
				window.location.href = '/dashboard';
			}, 2000);
			return () => clearTimeout(timer);
		} else if (isLoaded && user) {
			fetchUsage();
		}
	}, [isLoaded, user]);

	const plan = user?.publicMetadata?.plan || 'free';

	return (
		<div style={{ minHeight: '100vh', background: '#f8fafc' }}>
			{/* Navigation */}
			<nav style={{
				background: 'white',
				borderBottom: '1px solid #e5e7eb',
				padding: '1rem 2rem',
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center'
			}}>
				<Link href="/" style={{ textDecoration: 'none', color: '#1e293b', fontSize: '1.5rem', fontWeight: '700' }}>
					📄 DocuFlow AI
				</Link>
				<div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
					{plan === 'free' && (
						<button
							onClick={handleUpgrade}
							style={{
								padding: '0.5rem 1.5rem',
								background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
								color: 'white',
								border: 'none',
								borderRadius: '8px',
								cursor: 'pointer',
								fontWeight: '600',
								fontSize: '15px'
							}}
						>
							⚡ Upgrade to Pro
						</button>
					)}
					<button
						onClick={handleSignOut}
						style={{
							padding: '0.5rem 1.5rem',
							background: '#f1f5f9',
							border: '1px solid #cbd5e1',
							borderRadius: '8px',
							color: '#475569',
							cursor: 'pointer',
							fontSize: '15px',
							fontWeight: '500'
						}}
					>
						Sign Out
					</button>
				</div>
			</nav>

			<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
				{/* Header */}
				<div style={{ marginBottom: '3rem' }}>
					<h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#0f172a', fontWeight: '800' }}>
						Dashboard
					</h1>
					<p style={{ color: '#64748b', fontSize: '1.1rem' }}>
						Process documents and track your usage
					</p>
				</div>

				{/* Usage Counter */}
				{usage && (
					<div style={{
						background: plan === 'free'
							? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
							: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
						padding: '3rem',
						borderRadius: '20px',
						marginBottom: '2rem',
						textAlign: 'center',
						color: 'white',
						boxShadow: plan === 'free'
							? '0 10px 30px rgba(59, 130, 246, 0.3)'
							: '0 10px 30px rgba(16, 185, 129, 0.3)'
					}}>
						<div style={{ fontSize: '5rem', fontWeight: '900', marginBottom: '0.5rem', lineHeight: '1' }}>
							{plan === 'free' ? `${usage.usageCount} / ${usage.limit}` : usage.usageCount}
						</div>
						<p style={{ fontSize: '1.5rem', opacity: 0.95, marginBottom: '0.5rem', fontWeight: '600' }}>
							{plan === 'free' ? 'Documents Processed' : 'Documents Processed'}
						</p>
						<p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
							{plan === 'free'
								? `${usage.remaining} remaining this month`
								: '✨ Unlimited • Pro Plan Active'
							}
						</p>
					</div>
				)}

				{/* Stats Grid */}
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
					{/* Account Card */}
					<div style={{
						background: 'white',
						padding: '2rem',
						borderRadius: '16px',
						border: '1px solid #e5e7eb'
					}}>
						<h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
							Account
						</h2>
						<p style={{ marginBottom: '1rem', color: '#475569', fontSize: '0.95rem' }}>
							<strong style={{ color: '#1e293b' }}>Email:</strong><br/>
							{user?.primaryEmailAddress?.emailAddress}
						</p>
						<div style={{
							marginTop: '1.5rem',
							display: 'inline-block',
							padding: '0.5rem 1.25rem',
							background: plan === 'pro'
								? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
								: '#f1f5f9',
							color: plan === 'pro' ? 'white' : '#64748b',
							borderRadius: '8px',
							fontSize: '0.85rem',
							fontWeight: '700',
							letterSpacing: '0.05em'
						}}>
							{(plan as string).toUpperCase()} PLAN
						</div>
					</div>

					{/* Usage Stats Card */}
					{usage && (
						<div style={{
							background: 'white',
							padding: '2rem',
							borderRadius: '16px',
							border: '1px solid #e5e7eb'
						}}>
							<h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
								Usage This Month
							</h2>
							<div style={{ marginBottom: '1.5rem' }}>
								<div style={{ fontSize: '3rem', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>
									{usage.usageCount}
									{plan === 'free' && (
										<span style={{ fontSize: '1.5rem', color: '#94a3b8', fontWeight: '600' }}> / {usage.limit}</span>
									)}
								</div>
								<p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem' }}>
									documents processed
								</p>
							</div>
							{plan === 'free' && (
								<div style={{
									padding: '1rem',
									background: '#eff6ff',
									borderRadius: '10px',
									border: '1px solid #dbeafe'
								}}>
									<p style={{ margin: 0, color: '#3b82f6', fontWeight: '600', fontSize: '0.95rem' }}>
										{usage.remaining} requests remaining
									</p>
								</div>
							)}
							{plan === 'pro' && (
								<div style={{
									padding: '1rem',
									background: '#d1fae5',
									borderRadius: '10px',
									border: '1px solid #a7f3d0'
								}}>
									<p style={{ margin: 0, color: '#059669', fontWeight: '600', fontSize: '0.95rem' }}>
										✨ Unlimited processing
									</p>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Test API Section */}
				<div style={{
					background: 'white',
					padding: '2.5rem',
					borderRadius: '16px',
					border: '1px solid #e5e7eb',
					marginBottom: '2rem'
				}}>
					<h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#0f172a', fontWeight: '700' }}>
						Test Document Processing
					</h2>
					<p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
						Click below to simulate processing a document. This counts toward your usage limit.
					</p>

					<button
						onClick={makeRequest}
						disabled={loading}
						style={{
							padding: '1rem 2rem',
							fontSize: '1rem',
							background: loading ? '#cbd5e1' : '#3b82f6',
							color: 'white',
							border: 'none',
							borderRadius: '10px',
							cursor: loading ? 'not-allowed' : 'pointer',
							fontWeight: '600',
							boxShadow: loading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)',
							transition: 'all 0.2s'
						}}
					>
						{loading ? '⏳ Processing...' : '📄 Process Document'}
					</button>

					{message && (
						<div
							style={{
								marginTop: '1.5rem',
								padding: '1rem 1.25rem',
								borderRadius: '10px',
								background: message.includes('✗') ? '#fef2f2' : '#d1fae5',
								border: `1px solid ${message.includes('✗') ? '#fecaca' : '#a7f3d0'}`,
								color: message.includes('✗') ? '#991b1b' : '#065f46',
								fontWeight: '500'
							}}
						>
							{message}
						</div>
					)}
				</div>

				{/* Upgrade CTA */}
				{plan === 'free' && (
					<div
						style={{
							background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
							padding: '3rem',
							borderRadius: '20px',
							color: 'white',
							textAlign: 'center',
							boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
						}}
					>
						<h3 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '700' }}>
							Unlock Unlimited Processing
						</h3>
						<p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.95, lineHeight: '1.6' }}>
							Process unlimited documents with faster processing speeds and priority support
						</p>
						<button
							onClick={handleUpgrade}
							style={{
								padding: '1rem 3rem',
								fontSize: '1.1rem',
								background: 'white',
								color: '#3b82f6',
								border: 'none',
								borderRadius: '10px',
								cursor: 'pointer',
								fontWeight: '700',
								boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
								transition: 'all 0.2s'
							}}
						>
							Upgrade to Pro - $29/mo
						</button>
					</div>
				)}

				{/* Pro Badge */}
				{plan === 'pro' && (
					<div
						style={{
							background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
							padding: '2rem',
							borderRadius: '20px',
							color: 'white',
							textAlign: 'center',
							boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
						}}
					>
						<div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✨</div>
						<h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
							Pro Plan Active
						</h3>
						<p style={{ opacity: 0.95 }}>
							You have unlimited document processing
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
