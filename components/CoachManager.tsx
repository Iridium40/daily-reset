'use client'
// components/CoachManager.tsx
// Used inside the admin panel to invite + manage downstream coaches.

import { useState, useEffect } from 'react'

type Coach  = { id: string; name: string | null; email: string; createdAt: string }
type Invite = { id: string; email: string; expiresAt: string; createdAt: string }

interface Props {
  orgSlug: string
  accent:  string
}

export default function CoachManager({ orgSlug, accent }: Props) {
  const [coaches,  setCoaches]  = useState<Coach[]>([])
  const [invites,  setInvites]  = useState<Invite[]>([])
  const [email,    setEmail]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [sending,  setSending]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  useEffect(() => { fetchData() }, [orgSlug])

  async function fetchData() {
    setLoading(true)
    const res  = await fetch(`/api/coaches?orgSlug=${orgSlug}`)
    const data = await res.json()
    setCoaches(data.coaches || [])
    setInvites(data.invites || [])
    setLoading(false)
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    setSending(true)
    const res  = await fetch('/api/coaches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, orgSlug }),
    })
    const data = await res.json()
    setSending(false)
    if (!res.ok) { setError(data.error || 'Failed to send invite.'); return }
    setSuccess(`Invite sent to ${email}`)
    setEmail('')
    fetchData()
  }

  async function cancelInvite(inviteId: string) {
    await fetch('/api/coaches', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteId, orgSlug }),
    })
    fetchData()
  }

  const isExpired = (date: string) => new Date(date) < new Date()

  return (
    <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 16, padding: '28px 28px', marginBottom: 20, boxShadow: '0 2px 8px rgba(44,36,22,0.06)' }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#2C2416', marginBottom: 6 }}>
        Coach Team
      </h2>
      <p style={{ fontSize: 13, color: '#7A6E5C', marginBottom: 24 }}>
        Invite downstream coaches to get their own admin access for this organization.
      </p>

      {/* Invite form */}
      <form onSubmit={sendInvite} style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="coach@example.com"
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8, border: '1px solid #E2D9C5', background: '#F7F2E8', fontSize: 14, color: '#2C2416', fontFamily: 'inherit', outline: 'none' }}
        />
        <button type="submit" disabled={sending}
          style={{ background: sending ? '#A89E8C' : accent, color: 'white', fontSize: 13, fontWeight: 600, padding: '10px 24px', borderRadius: 8, border: 'none', cursor: sending ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
          {sending ? 'Sending...' : 'Send Invite'}
        </button>
      </form>

      {error   && <div style={{ background: '#FDE8E8', border: '1px solid #C43B3B', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#C43B3B' }}>{error}</div>}
      {success && <div style={{ background: '#E8F4E8', border: '1px solid #5C6B3A', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#3E4A27' }}>✓ {success}</div>}

      {loading ? (
        <p style={{ fontSize: 13, color: '#A89E8C' }}>Loading...</p>
      ) : (
        <>
          {/* Active coaches */}
          {coaches.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A6E5C', marginBottom: 10 }}>Active Coaches ({coaches.length})</div>
              {coaches.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: '#F7F2E8', marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {(c.name || c.email)[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#2C2416' }}>{c.name || '—'}</div>
                    <div style={{ fontSize: 12, color: '#7A6E5C' }}>{c.email}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#A89E8C' }}>Joined {new Date(c.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}

          {/* Pending invites */}
          {invites.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A6E5C', marginBottom: 10 }}>Pending Invites ({invites.length})</div>
              {invites.map(inv => (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: '#F7F2E8', marginBottom: 6, opacity: isExpired(inv.expiresAt) ? 0.5 : 1 }}>
                  <div style={{ fontSize: 18 }}>📨</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#2C2416' }}>{inv.email}</div>
                    <div style={{ fontSize: 11, color: isExpired(inv.expiresAt) ? '#C43B3B' : '#A89E8C' }}>
                      {isExpired(inv.expiresAt) ? 'Expired' : `Expires ${new Date(inv.expiresAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  <button onClick={() => cancelInvite(inv.id)}
                    style={{ fontSize: 11, color: '#C43B3B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}

          {coaches.length === 0 && invites.length === 0 && (
            <p style={{ fontSize: 13, color: '#A89E8C', textAlign: 'center', padding: '16px 0' }}>
              No coaches yet. Send an invite above to add your first coach.
            </p>
          )}
        </>
      )}
    </div>
  )
}
