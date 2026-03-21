'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

type BookingRow = {
  id: string
  startsAt: string
  type: string
  status: string
  donationAmountCents: number
  client: { id: string; name: string; email: string; phone: string }
  counselor: { id: string; name: string }
  sessionNote: { id: string } | null
}

type ClientDetail = {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
  bookings: { id: string; startsAt: string; type: string; status: string; counselor: { name: string }; sessionNote: { id: string; content: string; createdAt: string } | null }[]
  hipaaIntake: { completedAt: string | null } | null
}

export default function BookingsAdmin() {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<'bookings' | 'clients'>('bookings')
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [clientDetail, setClientDetail] = useState<ClientDetail | null>(null)
  const [clientSearch, setClientSearch] = useState('')
  const [clients, setClients] = useState<any[]>([])
  const [loadingClients, setLoadingClients] = useState(false)

  const [noteModal, setNoteModal] = useState<{ bookingId: string; counselorId: string; noteId: string | null; content: string; privateNotes: string } | null>(null)
  const [savingNote, setSavingNote] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      await loadBookings()
    }
    init()
  }, [])

  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search.trim()) params.set('search', search.trim())
      const res = await fetch(`/api/bookings/admin?${params}`)
      if (!res.ok) throw new Error('Failed to load bookings')
      setBookings(await res.json())
    } catch { setError('Could not load bookings') }
    finally { setLoading(false) }
  }, [statusFilter, search])

  useEffect(() => { loadBookings() }, [statusFilter])

  async function loadClients() {
    setLoadingClients(true)
    try {
      const params = new URLSearchParams()
      if (clientSearch.trim()) params.set('search', clientSearch.trim())
      const res = await fetch(`/api/clients?${params}`)
      setClients(await res.json())
    } catch { setError('Could not load clients') }
    finally { setLoadingClients(false) }
  }

  useEffect(() => { if (tab === 'clients') loadClients() }, [tab])

  async function openClientDetail(id: string) {
    try {
      const res = await fetch(`/api/clients?id=${id}`)
      if (!res.ok) throw new Error()
      setClientDetail(await res.json())
    } catch { setError('Could not load client') }
  }

  async function updateBookingStatus(id: string, status: string) {
    try {
      await fetch('/api/bookings/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      await loadBookings()
    } catch { setError('Could not update booking status') }
  }

  async function openNoteEditor(bookingId: string, counselorId: string) {
    try {
      const res = await fetch(`/api/session-notes?bookingId=${bookingId}`)
      const note = await res.json()
      setNoteModal({
        bookingId,
        counselorId,
        noteId: note?.id || null,
        content: note?.content || '',
        privateNotes: note?.privateNotes || '',
      })
    } catch {
      setNoteModal({ bookingId, counselorId, noteId: null, content: '', privateNotes: '' })
    }
  }

  async function saveNote() {
    if (!noteModal) return
    setSavingNote(true)
    try {
      if (noteModal.noteId) {
        await fetch('/api/session-notes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: noteModal.noteId, content: noteModal.content, privateNotes: noteModal.privateNotes }),
        })
      } else {
        await fetch('/api/session-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: noteModal.bookingId, counselorId: noteModal.counselorId, content: noteModal.content, privateNotes: noteModal.privateNotes }),
        })
      }
      setNoteModal(null)
      await loadBookings()
    } catch { setError('Could not save note') }
    finally { setSavingNote(false) }
  }

  return (
    <Shell>
      {error && <Banner type="error">{error}</Banner>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: '#2C2416', margin: 0 }}>Booking Management</h1>
        </div>
        <a href="/admin/bookings/counselors" style={{ background: '#5C6B3A', color: '#fff', fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 8, textDecoration: 'none' }}>
          Manage Counselors →
        </a>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        <TabBtn active={tab === 'bookings'} onClick={() => setTab('bookings')}>Bookings</TabBtn>
        <TabBtn active={tab === 'clients'} onClick={() => setTab('clients')}>Clients</TabBtn>
      </div>

      {tab === 'bookings' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectSt}>
              <option value="all">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <div style={{ display: 'flex', gap: 6, flex: 1 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadBookings()} placeholder="Search by client name or email..." style={{ ...inpSt, flex: 1 }} />
              <button onClick={loadBookings} style={smallBtn('#3E4A27', '#fff')}>Search</button>
            </div>
          </div>

          {loading ? <p style={{ color: '#7A6E5C' }}>Loading...</p> : bookings.length === 0 ? (
            <Card><p style={{ textAlign: 'center', color: '#7A6E5C', margin: '16px 0' }}>No bookings found.</p></Card>
          ) : (
            bookings.map(b => (
              <Card key={b.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{b.client.name}</span>
                      <StatusBadge status={b.status} />
                      <span style={{ fontSize: 11, color: '#A89E8C', background: '#F0EBE0', padding: '2px 8px', borderRadius: 4 }}>{b.type === 'VIRTUAL' ? 'Virtual' : 'In-Person'}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#7A6E5C', margin: '2px 0' }}>{b.client.email} · {b.client.phone}</p>
                    <p style={{ fontSize: 13, color: '#2C2416', margin: '4px 0' }}>
                      <strong>{b.counselor.name}</strong> · {formatDateTime(b.startsAt)}
                    </p>
                    <p style={{ fontSize: 12, color: '#5C6B3A', margin: '2px 0' }}>Donation: ${(b.donationAmountCents / 100).toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    {b.status === 'CONFIRMED' && (
                      <>
                        <button onClick={() => updateBookingStatus(b.id, 'COMPLETED')} style={smallBtn('#5C6B3A', '#fff')}>Mark Complete</button>
                        <button onClick={() => updateBookingStatus(b.id, 'CANCELLED')} style={smallBtn('transparent', '#C43B3B', '#C43B3B33')}>Cancel</button>
                      </>
                    )}
                    <button onClick={() => openNoteEditor(b.id, b.counselor.id)} style={smallBtn('transparent', '#3E4A27', '#E2D9C5')}>
                      {b.sessionNote ? 'Edit Note' : 'Add Note'}
                    </button>
                    <button onClick={() => openClientDetail(b.client.id)} style={smallBtn('transparent', '#7A6E5C', '#E2D9C5')}>Client Record</button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </>
      )}

      {tab === 'clients' && (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            <input value={clientSearch} onChange={e => setClientSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadClients()} placeholder="Search clients..." style={{ ...inpSt, flex: 1 }} />
            <button onClick={loadClients} style={smallBtn('#3E4A27', '#fff')}>Search</button>
          </div>

          {loadingClients ? <p style={{ color: '#7A6E5C' }}>Loading...</p> : clients.length === 0 ? (
            <Card><p style={{ textAlign: 'center', color: '#7A6E5C', margin: '16px 0' }}>No clients found.</p></Card>
          ) : (
            clients.map((c: any) => (
              <Card key={c.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                    <p style={{ fontSize: 12, color: '#7A6E5C', margin: '2px 0' }}>{c.email} · {c.phone}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#5C6B3A' }}>{c._count?.bookings || 0} bookings</span>
                      {c.hipaaIntake?.completedAt && <span style={{ fontSize: 11, color: '#3E4A27', background: '#E8F4E8', padding: '1px 6px', borderRadius: 4 }}>HIPAA ✓</span>}
                      {c.hipaaIntake && !c.hipaaIntake.completedAt && <span style={{ fontSize: 11, color: '#C45A1A', background: '#FDF8F3', padding: '1px 6px', borderRadius: 4 }}>HIPAA Pending</span>}
                    </div>
                  </div>
                  <button onClick={() => openClientDetail(c.id)} style={smallBtn('transparent', '#3E4A27', '#E2D9C5')}>View Record</button>
                </div>
              </Card>
            ))
          )}
        </>
      )}

      {clientDetail && (
        <Modal onClose={() => setClientDetail(null)}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#2C2416', marginTop: 0 }}>{clientDetail.name}</h2>
          <p style={{ fontSize: 13, color: '#7A6E5C', margin: '4px 0 16px' }}>{clientDetail.email} · {clientDetail.phone}</p>
          {clientDetail.hipaaIntake?.completedAt && <div style={{ fontSize: 12, color: '#3E4A27', background: '#E8F4E8', padding: '6px 12px', borderRadius: 8, marginBottom: 16, display: 'inline-block' }}>HIPAA Intake Completed</div>}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#7A6E5C', marginBottom: 8 }}>Booking History</h3>
          {clientDetail.bookings.length === 0 ? (
            <p style={{ fontSize: 13, color: '#A89E8C' }}>No bookings yet.</p>
          ) : (
            clientDetail.bookings.map(b => (
              <div key={b.id} style={{ background: '#F7F2E8', borderRadius: 10, padding: '12px 16px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{formatDateTime(b.startsAt)}</span>
                    <span style={{ fontSize: 11, color: '#7A6E5C', marginLeft: 8 }}>{b.counselor.name} · {b.type === 'VIRTUAL' ? 'Virtual' : 'In-Person'}</span>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                {b.sessionNote && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#2C2416', background: '#FDFAF4', padding: '8px 12px', borderRadius: 8, lineHeight: 1.5 }}>
                    <strong style={{ color: '#7A6E5C' }}>Session Note:</strong> {b.sessionNote.content}
                  </div>
                )}
              </div>
            ))
          )}
        </Modal>
      )}

      {noteModal && (
        <Modal onClose={() => setNoteModal(null)}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: '#2C2416', marginTop: 0, marginBottom: 16 }}>Session Note</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelSt}>Session Notes</label>
              <textarea value={noteModal.content} onChange={e => setNoteModal({ ...noteModal, content: e.target.value })} rows={5} style={{ ...inpSt, resize: 'vertical', minHeight: 80 }} placeholder="What was discussed, progress, observations..." />
            </div>
            <div>
              <label style={labelSt}>Private Notes (counselor only)</label>
              <textarea value={noteModal.privateNotes} onChange={e => setNoteModal({ ...noteModal, privateNotes: e.target.value })} rows={3} style={{ ...inpSt, resize: 'vertical', minHeight: 50 }} placeholder="Internal observations, follow-up reminders..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <button onClick={() => setNoteModal(null)} style={smallBtn('transparent', '#7A6E5C', '#E2D9C5')}>Cancel</button>
            <button onClick={saveNote} disabled={savingNote} style={smallBtn('#C45A1A', '#fff')}>{savingNote ? 'Saving...' : 'Save Note'}</button>
          </div>
        </Modal>
      )}
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
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>{children}</main>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 14, padding: '16px 20px', marginBottom: 10, boxShadow: '0 2px 8px rgba(44,36,22,0.05)' }}>{children}</div>
}

function Banner({ type, children }: { type: 'error' | 'success'; children: React.ReactNode }) {
  const isErr = type === 'error'
  return <div style={{ background: isErr ? '#FDE8E8' : '#E8F4E8', border: `1px solid ${isErr ? '#C43B3B' : '#5C6B3A'}`, borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: isErr ? '#C43B3B' : '#3E4A27' }}>{children}</div>
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      background: active ? '#3E4A27' : 'transparent',
      color: active ? '#fff' : '#7A6E5C',
      fontSize: 13,
      fontWeight: 600,
      padding: '8px 20px',
      borderRadius: 8,
      border: active ? 'none' : '1px solid #E2D9C5',
      cursor: 'pointer',
    }}>{children}</button>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    CONFIRMED: { bg: '#E8F4E8', fg: '#3E4A27' },
    COMPLETED: { bg: '#F0EBE0', fg: '#5C6B3A' },
    CANCELLED: { bg: '#FDE8E8', fg: '#C43B3B' },
  }
  const c = colors[status] || colors.CONFIRMED
  return <span style={{ fontSize: 10, fontWeight: 600, background: c.bg, color: c.fg, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>{status}</span>
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }} onClick={onClose}>
      <div style={{ background: '#FDFAF4', borderRadius: 16, padding: '28px 32px', maxWidth: 600, width: '100%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const inpSt: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E2D9C5', background: '#F7F2E8', fontSize: 13, color: '#2C2416', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }
const selectSt: React.CSSProperties = { ...inpSt, width: 'auto', minWidth: 140 }
const labelSt: React.CSSProperties = { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7A6E5C', display: 'block', marginBottom: 4 }

function smallBtn(bg: string, color: string, border?: string): React.CSSProperties {
  return { background: bg, color, fontSize: 11, fontWeight: 600, padding: '6px 14px', borderRadius: 6, border: border ? `1px solid ${border}` : 'none', cursor: 'pointer', whiteSpace: 'nowrap' }
}
