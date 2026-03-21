'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type AvailSlot = { id?: string; dayOfWeek: number; startTime: string; endTime: string }
type Counselor = {
  id: string
  name: string
  email: string
  phone: string
  zoomLink: string
  active: boolean
  availability: AvailSlot[]
}

type CounselorDraft = Omit<Counselor, 'id'> & { id: string | null }

const emptyCounselor: CounselorDraft = {
  id: null,
  name: '',
  email: '',
  phone: '',
  zoomLink: '',
  active: true,
  availability: [],
}

export default function CounselorsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [editing, setEditing] = useState<CounselorDraft | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      await loadCounselors()
    }
    init()
  }, [])

  const loadCounselors = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/counselors')
      if (!res.ok) throw new Error('Failed to load counselors')
      const data = await res.json()
      setCounselors(data.map((c: any) => ({
        id: c.id,
        name: c.name || '',
        email: c.email || '',
        phone: c.phone || '',
        zoomLink: c.zoomLink || '',
        active: c.active ?? true,
        availability: (c.availability || []).map((a: any) => ({
          id: a.id,
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
        })),
      })))
    } catch {
      setError('Could not load counselors.')
    } finally {
      setLoading(false)
    }
  }, [])

  async function handleSave() {
    if (!editing) return
    if (!editing.name.trim() || !editing.email.trim()) {
      setError('Name and email are required.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const isNew = !editing.id
      const endpoint = '/api/counselors'
      const res = await fetch(endpoint, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editing.id && { id: editing.id }),
          name: editing.name,
          email: editing.email,
          phone: editing.phone,
          zoomLink: editing.zoomLink,
          active: editing.active,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as any).error || `Save failed (${res.status})`)
      }
      const saved = await res.json()

      if (editing.availability.length > 0 || !isNew) {
        const avRes = await fetch('/api/counselors/availability', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            counselorId: saved.id,
            slots: editing.availability.map(s => ({
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
            })),
          }),
        })
        if (!avRes.ok) {
          const err = await avRes.json().catch(() => ({}))
          throw new Error((err as any).error || 'Could not save availability')
        }
      }

      setEditing(null)
      setSuccess(isNew ? 'Counselor added!' : 'Counselor updated!')
      setTimeout(() => setSuccess(''), 3000)
      await loadCounselors()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setError('')
    try {
      const res = await fetch('/api/counselors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Delete failed')
      setConfirmDelete(null)
      setSuccess('Counselor deleted.')
      setTimeout(() => setSuccess(''), 3000)
      await loadCounselors()
    } catch {
      setError('Could not delete counselor.')
    }
  }

  function addSlot() {
    if (!editing) return
    setEditing({
      ...editing,
      availability: [...editing.availability, { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }],
    })
  }

  function updateSlot(idx: number, field: keyof AvailSlot, value: any) {
    if (!editing) return
    const slots = [...editing.availability]
    slots[idx] = { ...slots[idx], [field]: value }
    setEditing({ ...editing, availability: slots })
  }

  function removeSlot(idx: number) {
    if (!editing) return
    setEditing({ ...editing, availability: editing.availability.filter((_, i) => i !== idx) })
  }

  if (loading) return <Shell><div style={{ textAlign: 'center', padding: 60, color: '#7A6E5C' }}>Loading...</div></Shell>

  return (
    <Shell>
      {error && <Banner type="error">{error}</Banner>}
      {success && <Banner type="success">{success}</Banner>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: '#2C2416', margin: 0 }}>Counselors</h1>
          <p style={{ fontSize: 13, color: '#7A6E5C', margin: '4px 0 0' }}>Manage counselors and their weekly availability windows.</p>
        </div>
        <button onClick={() => setEditing({ ...emptyCounselor })} style={btn('#C45A1A', '#fff')}>+ Add Counselor</button>
      </div>

      {editing && (
        <Card>
          <h3 style={cardTitle}>{editing.id ? 'Edit Counselor' : 'New Counselor'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <LabeledInput label="Name *" value={editing.name} onChange={v => setEditing({ ...editing, name: v })} placeholder="Jane Smith" />
            <LabeledInput label="Email *" value={editing.email} onChange={v => setEditing({ ...editing, email: v })} placeholder="jane@example.com" type="email" />
            <LabeledInput label="Phone" value={editing.phone} onChange={v => setEditing({ ...editing, phone: v })} placeholder="(555) 123-4567" />
            <LabeledInput label="Zoom Link (virtual sessions)" value={editing.zoomLink} onChange={v => setEditing({ ...editing, zoomLink: v })} placeholder="https://zoom.us/j/..." />
          </div>

          {editing.id && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13, color: '#2C2416', cursor: 'pointer' }}>
              <input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} />
              Active (visible for booking)
            </label>
          )}

          <div style={{ marginTop: 20, borderTop: '1px solid #E2D9C5', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A6E5C' }}>Weekly Availability</span>
              <button onClick={addSlot} style={btn('#5C6B3A', '#fff', true)}>+ Add Window</button>
            </div>

            {editing.availability.length === 0 && (
              <p style={{ fontSize: 13, color: '#A89E8C', fontStyle: 'italic' }}>No availability windows yet. Add one to allow bookings.</p>
            )}

            {editing.availability.map((slot, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <select value={slot.dayOfWeek} onChange={e => updateSlot(i, 'dayOfWeek', Number(e.target.value))} style={{ ...inp, width: 130 }}>
                  {DAY_LABELS.map((d, di) => <option key={di} value={di}>{d}</option>)}
                </select>
                <input type="time" value={slot.startTime} onChange={e => updateSlot(i, 'startTime', e.target.value)} style={{ ...inp, width: 120 }} />
                <span style={{ color: '#7A6E5C', fontSize: 13 }}>to</span>
                <input type="time" value={slot.endTime} onChange={e => updateSlot(i, 'endTime', e.target.value)} style={{ ...inp, width: 120 }} />
                <button onClick={() => removeSlot(i)} style={{ background: 'none', border: 'none', color: '#C43B3B', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '4px 8px' }} title="Remove">×</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditing(null)} style={btn('transparent', '#7A6E5C', true, '#E2D9C5')}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={btn('#C45A1A', '#fff')}>
              {saving ? 'Saving...' : editing.id ? 'Update Counselor' : 'Create Counselor'}
            </button>
          </div>
        </Card>
      )}

      {counselors.length === 0 && !editing && (
        <Card>
          <p style={{ textAlign: 'center', color: '#7A6E5C', fontSize: 14, margin: '20px 0' }}>No counselors yet. Click "+ Add Counselor" to get started.</p>
        </Card>
      )}

      {counselors.map(c => (
        <Card key={c.id}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2C2416', margin: 0 }}>{c.name}</h3>
                {!c.active && <span style={{ fontSize: 10, fontWeight: 600, color: '#A89E8C', background: '#F0EBE0', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>Inactive</span>}
              </div>
              <p style={{ fontSize: 13, color: '#7A6E5C', margin: '2px 0' }}>{c.email}{c.phone ? ` · ${c.phone}` : ''}</p>
              {c.zoomLink && <p style={{ fontSize: 12, color: '#A89E8C', margin: '2px 0', wordBreak: 'break-all' }}>Zoom: {c.zoomLink}</p>}

              {c.availability.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {c.availability.map((s, i) => (
                    <span key={i} style={{ fontSize: 11, background: '#F0EBE0', color: '#5C6B3A', padding: '3px 10px', borderRadius: 6, fontWeight: 500 }}>
                      {DAY_SHORT[s.dayOfWeek]} {s.startTime}–{s.endTime}
                    </span>
                  ))}
                </div>
              )}
              {c.availability.length === 0 && (
                <p style={{ fontSize: 12, color: '#C43B3B', marginTop: 8, fontStyle: 'italic' }}>No availability set — this counselor cannot be booked.</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setEditing({ id: c.id, name: c.name, email: c.email, phone: c.phone, zoomLink: c.zoomLink, active: c.active, availability: c.availability.map(a => ({ dayOfWeek: a.dayOfWeek, startTime: a.startTime, endTime: a.endTime })) })}
                style={btn('transparent', '#5C6B3A', true, '#E2D9C5')}
              >
                Edit
              </button>
              {confirmDelete === c.id ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleDelete(c.id)} style={btn('#C43B3B', '#fff', true)}>Confirm</button>
                  <button onClick={() => setConfirmDelete(null)} style={btn('transparent', '#7A6E5C', true, '#E2D9C5')}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(c.id)} style={btn('transparent', '#C43B3B', true, '#C43B3B33')}>Delete</button>
              )}
            </div>
          </div>
        </Card>
      ))}

      <div style={{ marginTop: 24 }}>
        <a href="/admin/bookings" style={{ fontSize: 13, color: '#7A6E5C', textDecoration: 'none' }}>← Back to Bookings Dashboard</a>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F2E8', minHeight: '100vh', color: '#2C2416' }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400..600&display=swap');` }} />
      <header style={{ background: '#3E4A27', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ffffff88', marginBottom: 2 }}>Admin</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: '#fff', margin: 0 }}>Booking Management</h1>
        </div>
      </header>
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 14, padding: '20px 24px', marginBottom: 14, boxShadow: '0 2px 8px rgba(44,36,22,0.05)' }}>
      {children}
    </div>
  )
}

function Banner({ type, children }: { type: 'error' | 'success'; children: React.ReactNode }) {
  const isErr = type === 'error'
  return (
    <div style={{ background: isErr ? '#FDE8E8' : '#E8F4E8', border: `1px solid ${isErr ? '#C43B3B' : '#5C6B3A'}`, borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: isErr ? '#C43B3B' : '#3E4A27' }}>
      {children}
    </div>
  )
}

function LabeledInput({ label, value, onChange, placeholder, type }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7A6E5C', display: 'block', marginBottom: 4 }}>{label}</label>
      <input type={type || 'text'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inp} />
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #E2D9C5',
  background: '#F7F2E8',
  fontSize: 13,
  color: '#2C2416',
  outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: 'border-box',
}

const cardTitle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 18,
  fontWeight: 600,
  color: '#2C2416',
  marginTop: 0,
  marginBottom: 16,
}

function btn(bg: string, color: string, small = false, border?: string): React.CSSProperties {
  return {
    background: bg,
    color,
    fontSize: small ? 12 : 13,
    fontWeight: 600,
    padding: small ? '7px 14px' : '10px 20px',
    borderRadius: 8,
    border: border ? `1px solid ${border}` : 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }
}
