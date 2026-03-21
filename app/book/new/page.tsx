'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import PaymentForm from '@/components/PaymentForm'

type Counselor = { id: string; name: string }
type Slot = { date: string; time: string; iso: string }

const MIN_DONATION = 1000

export default function NewClientBooking() {
  const router = useRouter()

  const [step, setStep] = useState<'info' | 'counselor' | 'slot' | 'payment' | 'done'>('info')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [selectedCounselor, setSelectedCounselor] = useState<string>('')

  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [donationCents, setDonationCents] = useState(MIN_DONATION)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState<any>(null)

  const [showAccountCreate, setShowAccountCreate] = useState(false)
  const [accountPassword, setAccountPassword] = useState('')
  const [accountCreating, setAccountCreating] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const [accountError, setAccountError] = useState('')

  useEffect(() => {
    fetch('/api/counselors')
      .then(r => r.json())
      .then(data => setCounselors(data.filter((c: any) => c.active).map((c: any) => ({ id: c.id, name: c.name }))))
      .catch(() => setError('Could not load counselors'))
  }, [])

  useEffect(() => {
    if (!selectedCounselor) return
    setLoadingSlots(true)
    setSlots([])
    setSelectedSlot('')
    fetch(`/api/bookings/slots?counselorId=${selectedCounselor}&isNew=true`)
      .then(r => r.json())
      .then(data => setSlots(data.slots || []))
      .catch(() => setError('Could not load available times'))
      .finally(() => setLoadingSlots(false))
  }, [selectedCounselor])

  const groupedSlots = useMemo(() => {
    const groups: Record<string, Slot[]> = {}
    for (const s of slots) {
      if (!groups[s.date]) groups[s.date] = []
      groups[s.date].push(s)
    }
    return groups
  }, [slots])

  function validateInfo() {
    if (!name.trim()) return 'Name is required'
    if (!email.trim() || !email.includes('@')) return 'Valid email is required'
    if (!phone.trim()) return 'Phone number is required'
    return null
  }

  function handleInfoNext() {
    const err = validateInfo()
    if (err) { setError(err); return }
    setError('')
    setStep('counselor')
  }

  function handleCounselorSelect(id: string) {
    setSelectedCounselor(id)
    setStep('slot')
  }

  function handleSlotSelect(iso: string) {
    setSelectedSlot(iso)
    setStep('payment')
  }

  async function handlePaymentSuccess(paymentId: string) {
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counselorId: selectedCounselor,
          startsAt: selectedSlot,
          type: 'IN_PERSON',
          name,
          email,
          phone,
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

  async function handleCreateAccount() {
    if (accountPassword.length < 6) {
      setAccountError('Password must be at least 6 characters.')
      return
    }
    setAccountCreating(true)
    setAccountError('')
    try {
      const res = await fetch('/api/clients/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: booking?.clientId, email, password: accountPassword }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as any).error || 'Account creation failed')
      }
      setAccountCreated(true)
    } catch (e) {
      setAccountError(e instanceof Error ? e.message : 'Failed to create account')
    } finally {
      setAccountCreating(false)
    }
  }

  const selectedDate = selectedSlot ? new Date(selectedSlot) : null
  const counselorName = counselors.find(c => c.id === selectedCounselor)?.name || ''

  return (
    <PageShell>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <button onClick={() => router.push('/book')} style={{ background: 'none', border: 'none', color: '#7A6E5C', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20 }}>
          ← Back
        </button>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: '#2C2416', marginBottom: 4 }}>
          New Client Booking
        </h1>
        <p style={{ fontSize: 13, color: '#7A6E5C', marginBottom: 28 }}>In-person sessions only · Must book 24+ hours ahead · Minimum $10 donation</p>

        <StepIndicator current={step} />

        {error && <div style={{ background: '#FDE8E8', border: '1px solid #C43B3B', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#C43B3B' }}>{error}</div>}

        {step === 'info' && (
          <Card>
            <h2 style={cardTitle}>Your Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <InputField label="Full Name" value={name} onChange={setName} placeholder="Jane Smith" />
              <InputField label="Email" value={email} onChange={setEmail} placeholder="jane@example.com" type="email" />
              <InputField label="Phone" value={phone} onChange={setPhone} placeholder="(555) 123-4567" type="tel" />
            </div>
            <button onClick={handleInfoNext} style={primaryBtn}>Continue →</button>
          </Card>
        )}

        {step === 'counselor' && (
          <Card>
            <h2 style={cardTitle}>Choose a Counselor</h2>
            {counselors.length === 0 ? (
              <p style={{ color: '#7A6E5C', fontSize: 14 }}>No counselors available at this time.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {counselors.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleCounselorSelect(c.id)}
                    style={{
                      background: '#F7F2E8',
                      border: '1px solid #E2D9C5',
                      borderRadius: 10,
                      padding: '14px 18px',
                      fontSize: 15,
                      fontWeight: 500,
                      color: '#2C2416',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'border-color 0.2s',
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setStep('info')} style={secondaryBtn}>← Back</button>
          </Card>
        )}

        {step === 'slot' && (
          <Card>
            <h2 style={cardTitle}>Pick a Time — {counselorName}</h2>
            {loadingSlots ? (
              <p style={{ color: '#7A6E5C' }}>Loading available times...</p>
            ) : Object.keys(groupedSlots).length === 0 ? (
              <p style={{ color: '#7A6E5C', fontSize: 14 }}>No available slots in the next 14 days. Please try another counselor.</p>
            ) : (
              <div style={{ maxHeight: 400, overflow: 'auto' }}>
                {Object.entries(groupedSlots).map(([date, daySlots]) => (
                  <div key={date} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#7A6E5C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                      {formatDateLabel(date)}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {daySlots.map(s => (
                        <button
                          key={s.iso}
                          onClick={() => handleSlotSelect(s.iso)}
                          style={{
                            background: '#fff',
                            border: '1px solid #E2D9C5',
                            borderRadius: 8,
                            padding: '8px 16px',
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#2C2416',
                            cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {formatTime(s.time)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setStep('counselor')} style={secondaryBtn}>← Back</button>
          </Card>
        )}

        {step === 'payment' && (
          <Card>
            <h2 style={cardTitle}>Donation & Payment</h2>
            <div style={{ background: '#F0EBE0', borderRadius: 10, padding: '14px 18px', marginBottom: 16, fontSize: 13, color: '#2C2416' }}>
              <strong>{counselorName}</strong> · In-Person<br />
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
          <>
            <Card>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: '#3E4A27', marginBottom: 8 }}>Booking Confirmed!</h2>
                <p style={{ fontSize: 14, color: '#7A6E5C', lineHeight: 1.6, marginBottom: 20 }}>
                  Your session with <strong>{booking.counselor?.name}</strong> is confirmed for<br />
                  <strong>{selectedDate && formatDateLabel(selectedDate.toISOString().slice(0, 10))} at {selectedDate && formatTime(selectedDate.toTimeString().slice(0, 5))}</strong>
                </p>
                <p style={{ fontSize: 13, color: '#7A6E5C', lineHeight: 1.5 }}>
                  A confirmation email has been sent to <strong>{email}</strong>.<br />
                  {booking.hipaaToken && <>You'll also receive an email with a secure link to complete your intake form.</>}
                </p>
                <p style={{ fontSize: 13, color: '#A89E8C', marginTop: 20 }}>
                  Your counselor will reach out to you before your session.
                </p>
              </div>
            </Card>

            {!accountCreated && (
              <Card>
                {!showAccountCreate ? (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 14, color: '#2C2416', fontWeight: 500, marginTop: 0, marginBottom: 8 }}>Create an account for faster rebooking</p>
                    <p style={{ fontSize: 12, color: '#7A6E5C', marginBottom: 16 }}>Save your info and keep a payment method on file for future sessions.</p>
                    <button onClick={() => setShowAccountCreate(true)} style={{ background: '#3E4A27', color: '#fff', fontSize: 13, fontWeight: 600, padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Create Account</button>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: '#2C2416', marginTop: 0, marginBottom: 12 }}>Create Your Account</h3>
                    <p style={{ fontSize: 12, color: '#7A6E5C', marginBottom: 12 }}>Email: <strong>{email}</strong></p>
                    {accountError && <div style={{ background: '#FDE8E8', border: '1px solid #C43B3B', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#C43B3B' }}>{accountError}</div>}
                    <div style={{ marginBottom: 12 }}>
                      <label style={labelStyle}>Password (min 6 characters)</label>
                      <input type="password" value={accountPassword} onChange={e => setAccountPassword(e.target.value)} placeholder="Choose a password" style={inp} />
                    </div>
                    <button onClick={handleCreateAccount} disabled={accountCreating} style={{ width: '100%', background: '#C45A1A', color: '#fff', fontSize: 14, fontWeight: 600, padding: '12px 20px', borderRadius: 8, border: 'none', cursor: accountCreating ? 'not-allowed' : 'pointer', opacity: accountCreating ? 0.7 : 1 }}>
                      {accountCreating ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                )}
              </Card>
            )}

            {accountCreated && (
              <Card>
                <div style={{ textAlign: 'center', color: '#3E4A27' }}>
                  <p style={{ fontWeight: 600, fontSize: 14, marginTop: 0 }}>Account created!</p>
                  <p style={{ fontSize: 13, color: '#7A6E5C' }}>You can now log in with <strong>{email}</strong> for future bookings.</p>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </PageShell>
  )
}

function StepIndicator({ current }: { current: string }) {
  const steps = [
    { key: 'info', label: 'Info' },
    { key: 'counselor', label: 'Counselor' },
    { key: 'slot', label: 'Time' },
    { key: 'payment', label: 'Payment' },
    { key: 'done', label: 'Done' },
  ]
  const currentIdx = steps.findIndex(s => s.key === current)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
      {steps.map((s, i) => (
        <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: i <= currentIdx ? '#C45A1A' : '#E2D9C5',
            color: i <= currentIdx ? '#fff' : '#7A6E5C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600,
          }}>
            {i < currentIdx ? '✓' : i + 1}
          </div>
          <span style={{ fontSize: 11, color: i <= currentIdx ? '#2C2416' : '#A89E8C', fontWeight: i === currentIdx ? 600 : 400 }}>
            {s.label}
          </span>
          {i < steps.length - 1 && <div style={{ width: 20, height: 1, background: '#E2D9C5' }} />}
        </div>
      ))}
    </div>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F2E8', minHeight: '100vh', color: '#2C2416' }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400..600&display=swap');` }} />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
        {children}
      </div>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 14, padding: '24px 28px', marginBottom: 16, boxShadow: '0 2px 8px rgba(44,36,22,0.05)' }}>
      {children}
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, type }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type || 'text'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inp} />
    </div>
  )
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

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#7A6E5C',
  display: 'block',
  marginBottom: 4,
}

const inp: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #E2D9C5',
  background: '#F7F2E8',
  fontSize: 14,
  color: '#2C2416',
  outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: 'border-box',
}

const cardTitle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 20,
  fontWeight: 600,
  color: '#2C2416',
  marginTop: 0,
  marginBottom: 16,
}

const primaryBtn: React.CSSProperties = {
  width: '100%',
  marginTop: 20,
  background: '#C45A1A',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  padding: '12px 20px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
}

const secondaryBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#7A6E5C',
  fontSize: 13,
  cursor: 'pointer',
  padding: '8px 0 0',
  fontFamily: "'DM Sans', sans-serif",
}
