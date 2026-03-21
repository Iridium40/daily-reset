'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import PaymentForm from '@/components/PaymentForm'

type Slot = { date: string; time: string; iso: string }

const MIN_DONATION = 1000

export default function ReturningClientBooking() {
  const router = useRouter()

  const [step, setStep] = useState<'lookup' | 'type' | 'slot' | 'payment' | 'done'>('lookup')
  const [lookupEmail, setLookupEmail] = useState('')
  const [lookupError, setLookupError] = useState('')
  const [lookingUp, setLookingUp] = useState(false)

  const [client, setClient] = useState<{ id: string; name: string; email: string; phone: string; lastCounselorId: string | null; lastCounselorName: string | null } | null>(null)
  const [bookingType, setBookingType] = useState<'IN_PERSON' | 'VIRTUAL'>('IN_PERSON')

  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [donationCents, setDonationCents] = useState(MIN_DONATION)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState<any>(null)

  async function handleLookup() {
    if (!lookupEmail.trim() || !lookupEmail.includes('@')) {
      setLookupError('Please enter a valid email address.')
      return
    }
    setLookingUp(true)
    setLookupError('')
    try {
      const res = await fetch(`/api/bookings?clientEmail=${encodeURIComponent(lookupEmail.trim())}`)
      const data = await res.json()
      if (!data.found) {
        setLookupError("We couldn't find an account with that email. If this is your first visit, please book as a new client.")
        return
      }
      setClient(data.client)
      setStep('type')
    } catch {
      setLookupError('Something went wrong. Please try again.')
    } finally {
      setLookingUp(false)
    }
  }

  function handleTypeSelect(type: 'IN_PERSON' | 'VIRTUAL') {
    setBookingType(type)
    if (!client?.lastCounselorId) {
      setError('No previous counselor found. Please book as a new client.')
      return
    }
    setLoadingSlots(true)
    fetch(`/api/bookings/slots?counselorId=${client.lastCounselorId}&isNew=false`)
      .then(r => r.json())
      .then(data => {
        setSlots(data.slots || [])
        setStep('slot')
      })
      .catch(() => setError('Could not load available times'))
      .finally(() => setLoadingSlots(false))
  }

  const groupedSlots = useMemo(() => {
    const groups: Record<string, Slot[]> = {}
    for (const s of slots) {
      if (!groups[s.date]) groups[s.date] = []
      groups[s.date].push(s)
    }
    return groups
  }, [slots])

  function handleSlotSelect(iso: string) {
    setSelectedSlot(iso)
    setStep('payment')
  }

  async function handlePaymentSuccess(paymentId: string) {
    if (!client) return
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counselorId: client.lastCounselorId,
          startsAt: selectedSlot,
          type: bookingType,
          name: client.name,
          email: client.email,
          phone: client.phone,
          donationAmountCents: donationCents,
          stripePaymentId: paymentId,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as any).error || 'Booking failed')
      }
      const data = await res.json()
      setBooking(data)
      setStep('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Booking failed')
    }
  }

  const selectedDate = selectedSlot ? new Date(selectedSlot) : null

  return (
    <PageShell>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <button onClick={() => router.push('/book')} style={{ background: 'none', border: 'none', color: '#7A6E5C', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20 }}>
          ← Back
        </button>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: '#2C2416', marginBottom: 4 }}>
          Welcome Back
        </h1>
        <p style={{ fontSize: 13, color: '#7A6E5C', marginBottom: 28 }}>Rebook with your counselor · In-person or virtual · Minimum $10 donation</p>

        {error && <Banner type="error">{error}</Banner>}

        {step === 'lookup' && (
          <Card>
            <h2 style={cardTitle}>Find Your Account</h2>
            <p style={{ fontSize: 13, color: '#7A6E5C', marginBottom: 16 }}>Enter the email you used for your last booking.</p>
            {lookupError && <Banner type="error">{lookupError}</Banner>}
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={lookupEmail}
                onChange={e => setLookupEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                placeholder="jane@example.com"
                style={inp}
              />
            </div>
            <button onClick={handleLookup} disabled={lookingUp} style={primaryBtn}>
              {lookingUp ? 'Looking up...' : 'Find My Account'}
            </button>
          </Card>
        )}

        {step === 'type' && client && (
          <Card>
            <h2 style={cardTitle}>Hello, {client.name}!</h2>
            <p style={{ fontSize: 13, color: '#7A6E5C', marginBottom: 16 }}>
              {client.lastCounselorName
                ? <>You'll be rebooking with <strong>{client.lastCounselorName}</strong>.</>
                : 'Choose your session type below.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => handleTypeSelect('IN_PERSON')} style={optionBtn}>
                <span style={{ fontWeight: 600 }}>In-Person Session</span>
                <span style={{ fontSize: 12, color: '#7A6E5C' }}>Meet face-to-face at our location</span>
              </button>
              <button onClick={() => handleTypeSelect('VIRTUAL')} style={optionBtn}>
                <span style={{ fontWeight: 600 }}>Virtual Session</span>
                <span style={{ fontSize: 12, color: '#7A6E5C' }}>Meet via Zoom video call</span>
              </button>
            </div>
            <button onClick={() => { setStep('lookup'); setClient(null) }} style={secondaryBtn}>← Use different email</button>
          </Card>
        )}

        {step === 'slot' && (
          <Card>
            <h2 style={cardTitle}>Pick a Time — {client?.lastCounselorName}</h2>
            {loadingSlots ? (
              <p style={{ color: '#7A6E5C' }}>Loading available times...</p>
            ) : Object.keys(groupedSlots).length === 0 ? (
              <p style={{ color: '#7A6E5C', fontSize: 14 }}>No available slots in the next 14 days. Please contact your counselor directly.</p>
            ) : (
              <div style={{ maxHeight: 400, overflow: 'auto' }}>
                {Object.entries(groupedSlots).map(([date, daySlots]) => (
                  <div key={date} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#7A6E5C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                      {formatDateLabel(date)}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {daySlots.map(s => (
                        <button key={s.iso} onClick={() => handleSlotSelect(s.iso)} style={slotBtn}>
                          {formatTime(s.time)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setStep('type')} style={secondaryBtn}>← Back</button>
          </Card>
        )}

        {step === 'payment' && (
          <Card>
            <h2 style={cardTitle}>Donation & Payment</h2>
            <div style={{ background: '#F0EBE0', borderRadius: 10, padding: '14px 18px', marginBottom: 16, fontSize: 13, color: '#2C2416' }}>
              <strong>{client?.lastCounselorName}</strong> · {bookingType === 'VIRTUAL' ? 'Virtual' : 'In-Person'}<br />
              {selectedDate && formatDateLabel(selectedDate.toISOString().slice(0, 10))} at {selectedDate && formatTime(selectedDate.toTimeString().slice(0, 5))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Donation Amount (minimum $10)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#2C2416' }}>$</span>
                <input
                  type="number"
                  min="10"
                  step="1"
                  value={donationCents / 100}
                  onChange={e => {
                    const val = Math.max(10, Math.round(Number(e.target.value) || 10))
                    setDonationCents(val * 100)
                  }}
                  style={{ ...inp, width: 120 }}
                />
              </div>
            </div>

            <PaymentForm
              amountCents={donationCents}
              onSuccess={handlePaymentSuccess}
              onError={msg => setError(msg)}
            />
            <button onClick={() => setStep('slot')} style={secondaryBtn}>← Back</button>
          </Card>
        )}

        {step === 'done' && booking && (
          <Card>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: '#3E4A27', marginBottom: 8 }}>Booking Confirmed!</h2>
              <p style={{ fontSize: 14, color: '#7A6E5C', lineHeight: 1.6, marginBottom: 20 }}>
                Your {bookingType === 'VIRTUAL' ? 'virtual' : 'in-person'} session with <strong>{booking.counselor?.name}</strong> is confirmed for<br />
                <strong>{selectedDate && formatDateLabel(selectedDate.toISOString().slice(0, 10))} at {selectedDate && formatTime(selectedDate.toTimeString().slice(0, 5))}</strong>
              </p>
              {bookingType === 'VIRTUAL' && booking.counselor?.zoomLink && (
                <p style={{ fontSize: 13, color: '#7A6E5C' }}>Zoom link: <a href={booking.counselor.zoomLink} style={{ color: '#C45A1A' }}>{booking.counselor.zoomLink}</a></p>
              )}
            </div>
          </Card>
        )}
      </div>
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F2E8', minHeight: '100vh', color: '#2C2416' }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400..600&display=swap');` }} />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>{children}</div>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 14, padding: '24px 28px', marginBottom: 16, boxShadow: '0 2px 8px rgba(44,36,22,0.05)' }}>{children}</div>
}

function Banner({ type, children }: { type: 'error' | 'success'; children: React.ReactNode }) {
  const isErr = type === 'error'
  return <div style={{ background: isErr ? '#FDE8E8' : '#E8F4E8', border: `1px solid ${isErr ? '#C43B3B' : '#5C6B3A'}`, borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: isErr ? '#C43B3B' : '#3E4A27' }}>{children}</div>
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7A6E5C', display: 'block', marginBottom: 4 }
const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2D9C5', background: '#F7F2E8', fontSize: 14, color: '#2C2416', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }
const cardTitle: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: '#2C2416', marginTop: 0, marginBottom: 16 }
const primaryBtn: React.CSSProperties = { width: '100%', marginTop: 20, background: '#C45A1A', color: '#fff', fontSize: 14, fontWeight: 600, padding: '12px 20px', borderRadius: 8, border: 'none', cursor: 'pointer' }
const secondaryBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#7A6E5C', fontSize: 13, cursor: 'pointer', padding: '8px 0 0', fontFamily: "'DM Sans', sans-serif" }
const optionBtn: React.CSSProperties = { background: '#F7F2E8', border: '1px solid #E2D9C5', borderRadius: 10, padding: '14px 18px', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4, fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#2C2416' }
const slotBtn: React.CSSProperties = { background: '#fff', border: '1px solid #E2D9C5', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, color: '#2C2416', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }
