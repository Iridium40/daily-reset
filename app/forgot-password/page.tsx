'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email,     setEmail]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const siteUrl = window.location.origin
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    })

    setSubmitted(true)
    setLoading(false)
  }

  return (
    <AuthCard title="Forgot Password" sub="We'll send you a reset link">
      {submitted ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <p style={{ color: '#5C6B3A', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Check your inbox</p>
          <p style={{ color: '#7A6E5C', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
            If an account exists for <strong>{email}</strong>, you'll receive a reset link within a few minutes.
          </p>
          <Link href="/login" style={{ color: '#C45A1A', fontSize: 13, fontWeight: 600 }}>← Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle} placeholder="your@email.com"
            />
          </div>
          <button type="submit" disabled={loading} style={btnStyle(loading)}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <Link href="/login" style={{ textAlign: 'center', color: '#7A6E5C', fontSize: 13 }}>← Back to sign in</Link>
        </form>
      )}
    </AuthCard>
  )
}

function AuthCard({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F2E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(44,36,22,0.12)' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: '#2C2416', marginBottom: 4, textAlign: 'center' }}>
          The Daily Reset
        </h1>
        <p style={{ fontSize: 13, color: '#7A6E5C', textAlign: 'center', marginBottom: 32 }}>{sub}</p>
        {children}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2D9C5', background: '#F7F2E8', fontSize: 14, color: '#2C2416', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
const btnStyle = (loading: boolean): React.CSSProperties => ({ background: loading ? '#A89E8C' : '#C45A1A', color: 'white', fontSize: 14, fontWeight: 600, padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 })
