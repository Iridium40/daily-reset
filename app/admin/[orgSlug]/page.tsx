'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import CoachManager from '@/components/CoachManager'
import HubSectionsEditor from '@/components/HubSectionsEditor'
import { createClient } from '@/lib/supabase/browser'
import type { HubLayout } from '@/lib/hubLayout'
import { parseHubLayout, serializeHubLayout } from '@/lib/hubLayout'
import type { HubContent } from '@/lib/hubContent'
import { parseHubContent, serializeHubContent } from '@/lib/hubContent'
import HubContentEditor from '@/components/HubContentEditor'

type AppUser = {
  role: string
  orgSlug: string | null
  email: string
}

type OrgConfig = {
  name:           string
  primaryColor:   string
  accentColor:    string
  welcomeMessage: string
  zoomRecordingsUrl: string
  facebookUrl:        string
}

type ZoomCall = {
  id: string
  title: string
  zoomLink: string
  passcode: string
  schedule: string
  meetingId: string
}

function contrastText(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#1A1A1A' : '#ffffff'
}

export default function AdminPage() {
  const router  = useRouter()
  const params  = useParams()
  const orgSlug = params?.orgSlug as string
  const supabase = createClient()

  const [user,   setUser]   = useState<AppUser | null>(null)
  const [config, setConfig] = useState<OrgConfig | null>(null)
  const [zoomCalls, setZoomCalls] = useState<ZoomCall[]>([])
  const [hubLayout, setHubLayout] = useState<HubLayout>(() => parseHubLayout(null))
  const [hubContent, setHubContent] = useState<HubContent>(() => parseHubContent(null))
  const [saving, setSaving]   = useState(false)
  const [saved,  setSaved]    = useState(false)
  const [error,  setError]    = useState('')
  const [authLoading, setAuthLoading] = useState(true)
  const [copied, setCopied]   = useState(false)

  const [authError, setAuthError] = useState('')

  // Auth guard
  useEffect(() => {
    async function checkAuth() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { router.push('/login'); return }

      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        setAuthError('Could not load your profile. The server may still be connecting to the database — please refresh in a moment.')
        setAuthLoading(false)
        return
      }
      const appUser = await res.json()
      setUser(appUser)

      if (appUser.role === 'ORG_ADMIN' && appUser.orgSlug !== orgSlug) {
        router.push(`/admin/${appUser.orgSlug}`)
        return
      }
      setAuthLoading(false)
    }
    checkAuth()
  }, [orgSlug, router])

  // Load org data
  useEffect(() => {
    if (!orgSlug || authLoading) return
    fetch(`/api/orgs/${orgSlug}`)
      .then(r => r.json())
      .then(data => {
        setConfig({
          name:           data.name           || 'Client Hub',
          primaryColor:   data.primaryColor   || '#3E4A27',
          accentColor:    data.accentColor    || '#C45A1A',
          welcomeMessage: data.welcomeMessage || "Watch the start video, grab the Zoom links, get your essentials, and use the Daily videos to stay consistent. Keep it simple. Don\u2019t overthink it. Just execute.",
          zoomRecordingsUrl: data.zoomRecordingsUrl || '',
          facebookUrl:    data.facebookUrl    || '',
        })
        setZoomCalls((data.zoomCalls || []).map((zc: any) => ({
          id: zc.id,
          title: zc.title || '',
          zoomLink: zc.zoomLink || '',
          passcode: zc.passcode || '',
          schedule: zc.schedule || '',
          meetingId: zc.meetingId || '',
        })))
        setHubLayout(parseHubLayout(data.hubSectionsJson))
        setHubContent(parseHubContent(data.hubContentJson))
      })
      .catch(() => setError('Could not load org config.'))
  }, [orgSlug, authLoading])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch(`/api/orgs/${orgSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          hubSectionsJson: serializeHubLayout(hubLayout),
          hubContentJson: serializeHubContent(hubContent),
        }),
      })
      if (!res.ok) throw new Error('Save failed')

      for (const zc of zoomCalls) {
        if (zc.id.startsWith('new-')) {
          await fetch('/api/zoom-calls', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orgSlug, title: zc.title, zoomLink: zc.zoomLink, passcode: zc.passcode, schedule: zc.schedule, meetingId: zc.meetingId }),
          })
        } else {
          await fetch('/api/zoom-calls', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: zc.id, orgSlug, title: zc.title, zoomLink: zc.zoomLink, passcode: zc.passcode, schedule: zc.schedule, meetingId: zc.meetingId }),
          })
        }
      }

      const refreshed = await fetch(`/api/zoom-calls?orgSlug=${orgSlug}`).then(r => r.json())
      setZoomCalls(refreshed.map((zc: any) => ({
        id: zc.id, title: zc.title || '', zoomLink: zc.zoomLink || '', passcode: zc.passcode || '',
        schedule: zc.schedule || '', meetingId: zc.meetingId || '',
      })))

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteZoomCall(id: string) {
    if (id.startsWith('new-')) {
      setZoomCalls(prev => prev.filter(zc => zc.id !== id))
      return
    }
    try {
      await fetch('/api/zoom-calls', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, orgSlug }),
      })
      setZoomCalls(prev => prev.filter(zc => zc.id !== id))
    } catch {
      setError('Failed to delete zoom call.')
    }
  }

  function handleAddZoomCall() {
    setZoomCalls(prev => [...prev, { id: `new-${Date.now()}`, title: '', zoomLink: '', passcode: '', schedule: '', meetingId: '' }])
  }

  function handleZoomCallChange(id: string, field: keyof ZoomCall, value: string) {
    setZoomCalls(prev => prev.map(zc => zc.id === id ? { ...zc, [field]: value } : zc))
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (authLoading || !config) {
    if (authError) return (
      <div style={{ ...styles.loading, flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#FDE8E8', border: '1px solid #C43B3B', borderRadius: 10, padding: '16px 24px', maxWidth: 500, textAlign: 'center', fontSize: 14, color: '#C43B3B' }}>
          {authError}
        </div>
        <button onClick={() => window.location.reload()} style={{ background: '#C45A1A', color: 'white', fontSize: 13, fontWeight: 600, padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    )
    return <div style={styles.loading}>Loading...</div>
  }

  const primary = config.primaryColor
  const accent  = config.accentColor
  const onPrimary = contrastText(primary)
  const onAccent  = contrastText(accent)

  const DEFAULTS = {
    name: 'Client Hub',
    primaryColor: '#3E4A27',
    accentColor: '#C45A1A',
    welcomeMessage: "Watch the start video, grab the Zoom links, get your essentials, and use the Daily videos to stay consistent. Keep it simple. Don\u2019t overthink it. Just execute.",
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F2E8', minHeight: '100vh', color: '#2C2416' }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400..600&display=swap');` }} />

      <header style={{ background: primary, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: `${onPrimary}aa`, marginBottom: 4 }}>Admin Panel</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: onPrimary, margin: 0 }}>{config.name || orgSlug}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href={`/org/${orgSlug}`} target="_blank" rel="noreferrer"
            style={{ background: accent, color: onAccent, fontSize: 12, fontWeight: 600, padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
            Preview Hub →
          </a>
          <button onClick={handleSignOut}
            style={{ background: 'transparent', border: `1px solid ${onPrimary}55`, color: onPrimary, fontSize: 11, fontWeight: 600, padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>

        {error && <div style={{ background: '#FDE8E8', border: '1px solid #C43B3B', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#C43B3B' }}>{error}</div>}
        {saved && <div style={{ background: '#E8F4E8', border: '1px solid #5C6B3A', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#3E4A27' }}>✓ Changes saved successfully!</div>}

        <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 16, padding: '20px 28px', marginBottom: 20, boxShadow: '0 2px 8px rgba(44,36,22,0.06)' }}>
          <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 8 }}>Client Hub URL</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/org/${orgSlug}`}
              style={{ ...styles.input, flex: 1, cursor: 'text', color: '#2C2416' }}
              onFocus={e => e.target.select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/org/${orgSlug}`)
                setCopied(true)
                setTimeout(() => setCopied(false), 2500)
              }}
              style={{ background: copied ? '#5C6B3A' : accent, color: copied ? '#fff' : onAccent, fontSize: 12, fontWeight: 600, padding: '11px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#A89E8C', marginTop: 8, marginBottom: 0 }}>Share this link with your clients so they can access their hub.</p>
        </div>

        <Section title="Branding">
          <Field label="Title">
            <input style={styles.input} value={config.name} onChange={e => setConfig({ ...config, name: e.target.value })} placeholder="e.g. Client Hub" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Primary Color (Header/Nav)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={config.primaryColor} onChange={e => setConfig({ ...config, primaryColor: e.target.value })} style={{ width: 48, height: 40, borderRadius: 8, border: '1px solid #E2D9C5', cursor: 'pointer', padding: 2 }} />
                <input style={{ ...styles.input, flex: 1 }} value={config.primaryColor} onChange={e => setConfig({ ...config, primaryColor: e.target.value })} placeholder="#3E4A27" />
              </div>
            </Field>
            <Field label="Accent Color (Buttons/Highlights)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={config.accentColor} onChange={e => setConfig({ ...config, accentColor: e.target.value })} style={{ width: 48, height: 40, borderRadius: 8, border: '1px solid #E2D9C5', cursor: 'pointer', padding: 2 }} />
                <input style={{ ...styles.input, flex: 1 }} value={config.accentColor} onChange={e => setConfig({ ...config, accentColor: e.target.value })} placeholder="#C45A1A" />
              </div>
            </Field>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              onClick={() => setConfig({ ...config, name: DEFAULTS.name, primaryColor: DEFAULTS.primaryColor, accentColor: DEFAULTS.accentColor })}
              style={{ fontSize: 11, fontWeight: 600, color: '#7A6E5C', background: 'none', border: '1px solid #E2D9C5', padding: '6px 14px', borderRadius: 6, cursor: 'pointer' }}>
              Reset to Default
            </button>
          </div>
        </Section>

        <Section title="Welcome Message">
          <Field label="Custom intro text shown at the top of the client hub">
            <textarea style={{ ...styles.input, minHeight: 100, resize: 'vertical' }} value={config.welcomeMessage} onChange={e => setConfig({ ...config, welcomeMessage: e.target.value })}
              placeholder="Welcome to our community! Watch the start video, grab the Zoom link, and use the Daily videos to stay consistent..." />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              onClick={() => setConfig({ ...config, welcomeMessage: DEFAULTS.welcomeMessage })}
              style={{ fontSize: 11, fontWeight: 600, color: '#7A6E5C', background: 'none', border: '1px solid #E2D9C5', padding: '6px 14px', borderRadius: 6, cursor: 'pointer' }}>
              Reset to Default
            </button>
          </div>
        </Section>

        <Section title="Client hub">
          <p style={{ fontSize: 13, color: '#7A6E5C', marginTop: 0, marginBottom: 20, lineHeight: 1.5 }}>
            Control what clients see on the hub page (<code style={{ fontSize: 12, background: '#F0E8D8', padding: '2px 6px', borderRadius: 4 }}>/org/{orgSlug}</code>).
            <strong style={{ color: '#3E4A27' }}> Step 1</strong> sets labels, navigation, and extra buttons.
            <strong style={{ color: '#3E4A27' }}> Step 2</strong> sets the copy, checklists, links, and videos inside each area.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <HubSubsection
              step={1}
              title="Structure & navigation"
              subtitle="Same top-to-bottom order as the hub: nav → onboarding → essentials → Zoom meetings → guides → tips → daily videos → Watch This card → account."
              accent={accent}
              onAccent={onAccent}
            >
              <HubSectionsEditor
                layout={hubLayout}
                onChange={setHubLayout}
                zoomCalls={zoomCalls}
                onZoomCallChange={handleZoomCallChange}
                onDeleteZoomCall={handleDeleteZoomCall}
                onAddZoomCall={handleAddZoomCall}
                zoomRecordingsUrl={config.zoomRecordingsUrl}
                onZoomRecordingsUrlChange={url => setConfig({ ...config, zoomRecordingsUrl: url })}
                accent={accent}
                onAccent={onAccent}
              />
            </HubSubsection>
            <HubSubsection
              step={2}
              title="Page content & links"
              subtitle="Hero video, onboarding & essentials checklists, guides, tips, daily videos, account cards, and completion messages."
              accent={accent}
              onAccent={onAccent}
            >
              <HubContentEditor content={hubContent} onChange={setHubContent} />
            </HubSubsection>
          </div>
        </Section>

        <Section title="Facebook Group">
          <Field label="Private Facebook Group URL">
            <input style={styles.input} value={config.facebookUrl} onChange={e => setConfig({ ...config, facebookUrl: e.target.value })} placeholder="https://www.facebook.com/groups/..." />
          </Field>
        </Section>

        <CoachManager orgSlug={orgSlug} accent={accent} />


      </main>

      <footer style={{ background: primary, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
        <a href={`/org/${orgSlug}`} target="_blank" rel="noreferrer"
          style={{ background: 'transparent', border: `1px solid ${onPrimary}55`, color: onPrimary, fontSize: 13, fontWeight: 600, padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
          Preview Hub
        </a>
        <button onClick={handleSave} disabled={saving}
          style={{ background: accent, color: saving ? '#fff' : onAccent, fontSize: 14, fontWeight: 600, padding: '10px 24px', borderRadius: 8, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 16, padding: '28px 28px', marginBottom: 20, boxShadow: '0 2px 8px rgba(44,36,22,0.06)' }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#2C2416', marginBottom: 20 }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </div>
  )
}

/** Groups hub layout vs hub body editors under one Client hub section. */
function HubSubsection({
  step,
  title,
  subtitle,
  accent,
  onAccent,
  children,
}: {
  step: number
  title: string
  subtitle: string
  accent: string
  onAccent: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        border: '1px solid #D8CDB8',
        borderRadius: 14,
        overflow: 'hidden',
        background: '#FFFCF7',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
          padding: '16px 18px',
          background: `linear-gradient(135deg, ${accent}14 0%, #F5EFE3 100%)`,
          borderBottom: '1px solid #E2D9C5',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: accent,
            color: onAccent,
            fontSize: 16,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {step}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2C2416', marginBottom: 6, letterSpacing: '-0.01em' }}>{title}</div>
          <p style={{ fontSize: 12, color: '#6B6254', margin: 0, lineHeight: 1.5 }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ padding: '18px 18px 12px' }}>{children}</div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 6 }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: '#A89E8C', marginBottom: 6 }}>{hint}</p>}
      {children}
    </div>
  )
}

const styles = {
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 8,
    border: '1px solid #E2D9C5',
    background: '#F7F2E8',
    fontSize: 14,
    color: '#2C2416',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
  } as React.CSSProperties,
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: "'DM Sans', sans-serif",
    color: '#7A6E5C',
    fontSize: 16,
  } as React.CSSProperties,
}
