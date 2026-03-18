'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#7A6E5C' }}>Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  )
}

function ResetPasswordInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)
  const [ready,     setReady]     = useState(false)

  // Supabase handles the token exchange via the URL hash automatically.
  // We just need to wait for the session to be established.
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    // Also check if there's already a session (user clicked the link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm)  { setError('Passwords do not match.'); return }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (updateError) { setError(updateError.message); return }

    setSuccess(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F2E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(44,36,22,0.12)' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: '#2C2416', marginBottom: 4, textAlign: 'center' }}>
          The Daily Metabolic Reboot
        </h1>
        <p style={{ fontSize: 13, color: '#7A6E5C', textAlign: 'center', marginBottom: 32 }}>Set a new password</p>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <p style={{ color: '#5C6B3A', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Password updated!</p>
            <p style={{ color: '#7A6E5C', fontSize: 13 }}>Redirecting you to sign in...</p>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#7A6E5C', fontSize: 14 }}>Validating your reset link...</p>
            <p style={{ color: '#A89E8C', fontSize: 12, marginTop: 8 }}>If this takes too long, the link may have expired. <Link href="/forgot-password" style={{ color: '#C45A1A' }}>Request a new one</Link>.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{ background: '#FDE8E8', border: '1px solid #C43B3B', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#C43B3B' }}>
                {error}
              </div>
            )}
            <div>
              <label style={labelStyle}>New Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                style={inputStyle} placeholder="Minimum 8 characters" />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                style={inputStyle} placeholder="Re-enter your password" />
            </div>
            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
            <Link href="/login" style={{ textAlign: 'center', color: '#7A6E5C', fontSize: 13 }}>← Back to sign in</Link>
          </form>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2D9C5', background: '#F7F2E8', fontSize: 14, color: '#2C2416', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
const btnStyle = (loading: boolean): React.CSSProperties => ({ background: loading ? '#A89E8C' : '#C45A1A', color: 'white', fontSize: 14, fontWeight: 600, padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' })
