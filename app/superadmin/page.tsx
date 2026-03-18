'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

type AppUser = {
  role: string
  orgSlug: string | null
  email: string
}

type Org = {
  id:        string
  slug:      string
  name:      string
  logoUrl:   string | null
  zoomLink:  string | null
  createdAt: string
  _count?:   { users: number }
}

export default function SuperAdminPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [user,     setUser]     = useState<AppUser | null>(null)
  const [orgs,     setOrgs]     = useState<Org[]>([])
  const [creating, setCreating] = useState(false)
  const [copied,   setCopied]   = useState<string | null>(null)
  const [newOrg,   setNewOrg]   = useState({ name: '', slug: '', adminEmail: '', adminPassword: '' })
  const [error,    setError]    = useState('')
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push('/login'); return }

      const res = await fetch('/api/auth/me')
      if (!res.ok) { router.push('/login'); return }
      const appUser = await res.json()
      setUser(appUser)

      if (appUser.role === 'ORG_ADMIN') {
        window.location.href = `/admin/${appUser.orgSlug}`
        return
      }
      if (appUser.role === 'SUPER_ADMIN') fetchOrgs()
      setAuthLoading(false)
    }
    checkAuth()
  }, [router])

  async function fetchOrgs() {
    const res  = await fetch('/api/superadmin/orgs')
    const data = await res.json()
    setOrgs(data)
  }

  async function createOrg() {
    setError('')
    if (!newOrg.name || !newOrg.slug || !newOrg.adminEmail || !newOrg.adminPassword) {
      setError('All fields are required.')
      return
    }
    const res = await fetch('/api/superadmin/orgs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrg),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || 'Failed to create org.')
      return
    }
    setCreating(false)
    setNewOrg({ name: '', slug: '', adminEmail: '', adminPassword: '' })
    fetchOrgs()
  }

  async function deleteOrg(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    await fetch(`/api/superadmin/orgs/${id}`, { method: 'DELETE' })
    fetchOrgs()
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  if (authLoading) return <div style={styles.loading}>Loading...</div>

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F2E8', minHeight: '100vh', color: '#2C2416' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <header style={{ background: '#3E4A27', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8A9D5C', marginBottom: 4 }}>Master Admin</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: '#FDFAF4', margin: 0 }}>The Daily Reset</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#8A9D5C' }}>{user?.email}</div>
          <button onClick={handleSignOut}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#A89E8C', fontSize: 11, fontWeight: 600, padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
          <StatCard label="Total Organizations" value={orgs.length} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, margin: 0 }}>Coach Organizations</h2>
          <button onClick={() => setCreating(true)}
            style={{ background: '#C45A1A', color: 'white', fontSize: 13, fontWeight: 600, padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
            + New Organization
          </button>
        </div>

        {creating && (
          <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 16, padding: 28, marginBottom: 20, boxShadow: '0 4px 20px rgba(44,36,22,0.1)' }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, marginBottom: 20 }}>New Coaching Organization</h3>
            {error && <div style={{ background: '#FDE8E8', border: '1px solid #C43B3B', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#C43B3B' }}>{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Organization Name', key: 'name',          placeholder: 'e.g. The Smith Coaching Team' },
                { label: 'URL Slug',          key: 'slug',          placeholder: 'e.g. smith-team (lowercase, no spaces)' },
                { label: 'Admin Email',       key: 'adminEmail',    placeholder: 'coach@example.com' },
                { label: 'Temp Password',     key: 'adminPassword', placeholder: 'Temporary password for admin' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2D9C5', background: '#F7F2E8', fontSize: 14, color: '#2C2416', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    value={(newOrg as any)[f.key]}
                    onChange={e => setNewOrg({ ...newOrg, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                  />
                  {f.key === 'slug' && newOrg.slug && (
                    <div style={{ fontSize: 11, color: '#8A9D5C', marginTop: 4 }}>Hub URL: {baseUrl}/org/{newOrg.slug}</div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setCreating(false); setError('') }}
                style={{ fontSize: 13, fontWeight: 600, color: '#7A6E5C', padding: '10px 20px', border: '1px solid #E2D9C5', borderRadius: 8, background: 'transparent', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={createOrg}
                style={{ background: '#C45A1A', color: 'white', fontSize: 13, fontWeight: 600, padding: '10px 24px', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                Create Organization
              </button>
            </div>
          </div>
        )}

        <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(44,36,22,0.07)' }}>
          {orgs.length === 0 ? (
            <div style={{ padding: '40px 28px', textAlign: 'center', color: '#A89E8C', fontSize: 14 }}>No organizations yet. Create your first one above.</div>
          ) : orgs.map((org, i) => (
            <div key={org.id} style={{ padding: '18px 24px', borderBottom: i < orgs.length - 1 ? '1px solid #EDE4D0' : 'none', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {org.logoUrl && <img src={org.logoUrl} alt={org.name} style={{ height: 36, width: 36, objectFit: 'contain', borderRadius: 6 }} />}
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#2C2416' }}>{org.name}</div>
                <div style={{ fontSize: 12, color: '#A89E8C', fontFamily: 'monospace' }}>/org/{org.slug}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => copyToClipboard(`${baseUrl}/org/${org.slug}`, `hub-${org.id}`)}
                  style={styles.smallBtn('#5C6B3A')}>
                  {copied === `hub-${org.id}` ? '✓ Copied!' : '📋 Copy Hub URL'}
                </button>
                <button onClick={() => copyToClipboard(`${baseUrl}/admin/${org.slug}`, `admin-${org.id}`)}
                  style={styles.smallBtn('#7A6E5C')}>
                  {copied === `admin-${org.id}` ? '✓ Copied!' : '🔑 Copy Admin URL'}
                </button>
                <a href={`/org/${org.slug}`} target="_blank" rel="noreferrer" style={{ ...styles.smallBtn('#3E4A27'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  👁 Preview
                </a>
                <a href={`/admin/${org.slug}`} target="_blank" rel="noreferrer" style={{ ...styles.smallBtn('#C45A1A'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  ⚙️ Configure
                </a>
                <button onClick={() => deleteOrg(org.id, org.name)}
                  style={styles.smallBtn('#C43B3B')}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 14, padding: '20px 24px', boxShadow: '0 2px 8px rgba(44,36,22,0.06)' }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: '#3E4A27' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#7A6E5C', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  )
}

const styles = {
  loading: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', fontFamily: "'DM Sans', sans-serif",
    color: '#7A6E5C', fontSize: 16,
  } as React.CSSProperties,
  smallBtn: (bg: string) => ({
    background: bg, color: 'white',
    fontSize: 11, fontWeight: 600, padding: '6px 12px',
    borderRadius: 6, border: 'none', cursor: 'pointer',
    whiteSpace: 'nowrap',
  } as React.CSSProperties),
}
