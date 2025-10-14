'use client';

import { useAuth, useUser, UserButton } from '@clerk/nextjs';
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
	const { user } = useUser();
	const [usage, setUsage] = useState<UsageData | null>(null);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');

	const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

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
				setMessage(`Success! ${data.data?.message}`);
				await fetchUsage();
			} else {
				setMessage(`Error: ${data.error || 'Request failed'} ${data.message || ''}`);
			}
		} catch (error) {
			setMessage('Failed to make request');
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
		fetchUsage();
	}, []);

	const plan = user?.publicMetadata?.plan || 'free';

	return (
		<div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
			{/* Navigation */}
			<nav style={{
				background: 'white',
				borderBottom: '1px solid #e0e0e0',
				padding: '1rem 2rem',
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center'
			}}>
				<Link href="/" style={{ textDecoration: 'none', color: '#667eea', fontSize: '1.5rem', fontWeight: 'bold' }}>
					📄 DocuFlow AI
				</Link>
				<UserButton />
			</nav>

			<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
				<h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#333' }}>Dashboard</h1>
				<p style={{ color: '#666', marginBottom: '2rem' }}>Process documents and track your usage</p>

				{/* BIG PROMINENT COUNTER */}
				{usage && plan === 'free' && (
					<div style={{
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						padding: '2rem',
						borderRadius: '16px',
						marginBottom: '2rem',
						textAlign: 'center',
						color: 'white',
						boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
					}}>
						<div style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '0.5rem' }}>
							{usage.usageCount} / {usage.limit}
						</div>
						<p style={{ fontSize: '1.3rem', opacity: 0.95, marginBottom: '0.5rem' }}>Documents Processed</p>
						<p style={{ fontSize: '1.1rem', opacity: 0.85 }}>
							{usage.remaining} remaining this month
						</p>
					</div>
				)}

				{usage && plan === 'pro' && (
					<div style={{
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						padding: '2rem',
						borderRadius: '16px',
						marginBottom: '2rem',
						textAlign: 'center',
						color: 'white',
						boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
					}}>
						<div style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '0.5rem' }}>
							{usage.usageCount}
						</div>
						<p style={{ fontSize: '1.3rem', opacity: 0.95, marginBottom: '0.5rem' }}>Documents Processed</p>
						<p style={{ fontSize: '1.1rem', opacity: 0.85 }}>
							✨ Unlimited • Pro Plan Active
						</p>
					</div>
				)}

				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
					{/* User Info Card */}
					<div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
						<h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#333' }}>Account</h2>
						<p style={{ marginBottom: '0.5rem', color: '#666' }}>
							<strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}
						</p>
						<div style={{ marginTop: '1rem', display: 'inline-block', padding: '0.5rem 1rem', background: plan === 'pro' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0', color: plan === 'pro' ? 'white' : '#333', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
							{(plan as string).toUpperCase()}
						</div>
					</div>

					{/* Usage Stats Card */}
					{usage && (
						<div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
							<h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#333' }}>Usage Statistics</h2>
							<div style={{ marginBottom: '1rem' }}>
								<div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#667eea' }}>
									{usage.usageCount} <span style={{ fontSize: '1rem', color: '#666', fontWeight: '400' }}>/ {usage.limit}</span>
								</div>
								<p style={{ color: '#666', fontSize: '0.9rem' }}>Documents processed</p>
							</div>
							<div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0f8ff', borderRadius: '8px' }}>
								<p style={{ margin: 0, color: '#667eea', fontWeight: '600' }}>
									{usage.remaining} {typeof usage.remaining === 'number' ? 'remaining' : ''}
								</p>
							</div>
						</div>
					)}
				</div>

				{/* Test API Section */}
				<div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
					<h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>Test Document Processing</h2>
					<p style={{ color: '#666', marginBottom: '2rem' }}>Click below to simulate processing a document (counts toward your usage)</p>

					<button
						onClick={makeRequest}
						disabled={loading}
						style={{
							padding: '1rem 2rem',
							fontSize: '16px',
							background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							color: 'white',
							border: 'none',
							borderRadius: '8px',
							cursor: loading ? 'not-allowed' : 'pointer',
							fontWeight: '600',
							boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
						}}
					>
						{loading ? 'Processing...' : '📄 Process Document'}
					</button>

					{message && (
						<div
							style={{
								marginTop: '1.5rem',
								padding: '1rem',
								borderRadius: '8px',
								background: message.includes('Error') ? '#fee' : '#d4edda',
								border: `1px solid ${message.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`,
								color: message.includes('Error') ? '#721c24' : '#155724'
							}}
						>
							{message}
						</div>
					)}
				</div>

				{/* Upgrade Section */}
				{plan === 'free' && (
					<div
						style={{
							background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							padding: '3rem',
							borderRadius: '12px',
							color: 'white',
							textAlign: 'center'
						}}
					>
						<h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Unlock Unlimited Processing</h3>
						<p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.95 }}>
							Process unlimited documents, faster processing, and priority support
						</p>
						<button
							onClick={handleUpgrade}
							style={{
								padding: '1rem 3rem',
								fontSize: '18px',
								background: 'white',
								color: '#667eea',
								border: 'none',
								borderRadius: '8px',
								cursor: 'pointer',
								fontWeight: '700',
								boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
							}}
						>
							Upgrade to Pro - $29/mo
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
