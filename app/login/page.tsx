'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPw,   setShowPw]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email, password,
    })

    if (signInError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    // Fetch app user to determine redirect
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const user = await res.json()
        if (user?.role === 'SUPER_ADMIN') {
          router.push('/superadmin')
        } else if (user?.orgSlug) {
          router.push(`/admin/${user.orgSlug}`)
        } else {
          router.push('/superadmin')
        }
        router.refresh()
        return
      }
    } catch {
      // network error
    }

    setError('Signed in, but could not load your profile. The server may be starting up — please wait a moment and try again.')
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F2E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(44,36,22,0.12)' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: '#2C2416', marginBottom: 4, textAlign: 'center' }}>
          The Daily Reset
        </h1>
        <p style={{ fontSize: 13, color: '#7A6E5C', textAlign: 'center', marginBottom: 32 }}>Admin Sign In</p>

        {error && (
          <div style={{ background: '#FDE8E8', border: '1px solid #C43B3B', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#C43B3B' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2D9C5', background: '#F7F2E8', fontSize: 14, color: '#2C2416', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              placeholder="your@email.com" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width: '100%', padding: '12px 44px 12px 14px', borderRadius: 10, border: '1px solid #E2D9C5', background: '#F7F2E8', fontSize: 14, color: '#2C2416', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 18, lineHeight: 1, color: '#7A6E5C' }}
                aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            style={{ background: loading ? '#A89E8C' : '#C45A1A', color: 'white', fontSize: 14, fontWeight: 600, padding: '14px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <a href="/forgot-password" style={{ textAlign: 'center', display: 'block', color: '#7A6E5C', fontSize: 13, marginTop: 4 }}>
            Forgot your password?
          </a>
        </form>
        <div style={{ borderTop: '1px solid #E2D9C5', marginTop: 28, paddingTop: 16, textAlign: 'center' }}>
          <a href="/terms" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#A89E8C', textDecoration: 'none' }}>
            Terms of Service &amp; Disclosures
          </a>
        </div>
      </div>
    </div>
  )
}
