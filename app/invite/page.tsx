'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

type InviteInfo = {
  orgName: string
  email:   string
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#7A6E5C' }}>Loading...</div>}>
      <InviteInner />
    </Suspense>
  )
}

function InviteInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') || ''
  const supabase     = createClient()

  const [info,     setInfo]     = useState<InviteInfo | null>(null)
  const [invalid,  setInvalid]  = useState(false)
  const [name,     setName]     = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    if (!token) { setInvalid(true); return }
    fetch(`/api/invite/validate?token=${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) setInvalid(true); else setInfo(d) })
      .catch(() => setInvalid(true))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm)  { setError('Passwords do not match.'); return }

    setLoading(true)

    // Server creates the Supabase auth user + Prisma user record
    const res  = await fetch('/api/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name, password }),
    })
    const data = await res.json()

    if (!res.ok) { setError(data.error || 'Something went wrong.'); setLoading(false); return }

    // Sign in with the new account
    await supabase.auth.signInWithPassword({
      email: data.email,
      password,
    })

    router.push(`/admin/${data.orgSlug}`)
    router.refresh()
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F2E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(44,36,22,0.12)' }}>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: '#2C2416', marginBottom: 4, textAlign: 'center' }}>
          The Daily Reset
        </h1>

        {invalid ? (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <p style={{ color: '#C43B3B', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Invalid or expired invite</p>
            <p style={{ color: '#7A6E5C', fontSize: 13 }}>This invite link has expired or already been used. Ask your coach admin to send a new invite.</p>
          </div>
        ) : !info ? (
          <p style={{ textAlign: 'center', color: '#7A6E5C', fontSize: 14, marginTop: 24 }}>Validating your invite...</p>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#2C2416', marginBottom: 4 }}>You're invited to join</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#3E4A27' }}>{info.orgName}</p>
              <p style={{ fontSize: 12, color: '#A89E8C', marginTop: 4 }}>as a Coach Admin</p>
            </div>

            {error && (
              <div style={{ background: '#FDE8E8', border: '1px solid #C43B3B', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#C43B3B' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Your Name</label>
                <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle} placeholder="Jane Smith" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input value={info.email} disabled style={{ ...inputStyle, opacity: 0.6 }} />
              </div>
              <div>
                <label style={labelStyle}>Create Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} placeholder="Minimum 8 characters" />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={inputStyle} placeholder="Re-enter password" />
              </div>
              <button type="submit" disabled={loading} style={btnStyle(loading)}>
                {loading ? 'Creating account...' : 'Accept Invite & Create Account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2D9C5', background: '#F7F2E8', fontSize: 14, color: '#2C2416', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
const btnStyle = (loading: boolean): React.CSSProperties => ({ background: loading ? '#A89E8C' : '#C45A1A', color: 'white', fontSize: 14, fontWeight: 600, padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 })
