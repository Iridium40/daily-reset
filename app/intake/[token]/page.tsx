'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

type IntakeData = {
  dateOfBirth: string
  gender: string
  address: string
  city: string
  state: string
  zip: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  currentMedications: string
  allergies: string
  medicalConditions: string
  previousCounseling: string
  primaryConcern: string
  goals: string
  consentAcknowledged: boolean
}

const empty: IntakeData = {
  dateOfBirth: '',
  gender: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  currentMedications: '',
  allergies: '',
  medicalConditions: '',
  primaryConcern: '',
  previousCounseling: '',
  goals: '',
  consentAcknowledged: false,
}

export default function IntakeFormPage() {
  const params = useParams()
  const token = params?.token as string

  const [loading, setLoading] = useState(true)
  const [clientName, setClientName] = useState('')
  const [completed, setCompleted] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [form, setForm] = useState<IntakeData>(empty)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    fetch(`/api/intake?token=${token}`)
      .then(r => {
        if (!r.ok) throw new Error('not found')
        return r.json()
      })
      .then(data => {
        setClientName(data.clientName)
        if (data.completed) setCompleted(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.consentAcknowledged) {
      setError('You must acknowledge the consent to continue.')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, formData: form }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as any).error || 'Submission failed')
      }
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  function set(field: keyof IntakeData, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  if (loading) return <Shell><Center>Loading...</Center></Shell>
  if (notFound) return <Shell><Center><h2 style={{ color: '#C43B3B' }}>Invalid or expired link</h2><p style={{ color: '#7A6E5C' }}>This intake form link is not valid. Please contact your counselor for a new link.</p></Center></Shell>
  if (completed) return <Shell><Center><h2 style={{ color: '#3E4A27' }}>Already Completed</h2><p style={{ color: '#7A6E5C' }}>This intake form has already been submitted. Thank you!</p></Center></Shell>
  if (submitted) return <Shell><Center><div style={{ fontSize: 48 }}>✓</div><h2 style={{ color: '#3E4A27', fontFamily: "'Cormorant Garamond', serif" }}>Form Submitted</h2><p style={{ color: '#7A6E5C', lineHeight: 1.6 }}>Thank you, {clientName}. Your health information has been securely saved. Your counselor will review it before your session.</p></Center></Shell>

  return (
    <Shell>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: '#2C2416', marginBottom: 4 }}>Health Information Form</h1>
      <p style={{ fontSize: 13, color: '#7A6E5C', marginBottom: 4 }}>Welcome, {clientName}. Please fill out the form below.</p>
      <p style={{ fontSize: 11, color: '#A89E8C', marginBottom: 24, lineHeight: 1.5 }}>Your information is confidential and protected under HIPAA guidelines. Only your counselor will have access to this data.</p>

      {error && <div style={{ background: '#FDE8E8', border: '1px solid #C43B3B', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#C43B3B' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <Section title="Personal Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Inp label="Date of Birth" type="date" value={form.dateOfBirth} onChange={v => set('dateOfBirth', v)} />
            <div>
              <label style={labelSt}>Gender</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)} style={inpSt}>
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>
          </div>
          <Inp label="Street Address" value={form.address} onChange={v => set('address', v)} />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
            <Inp label="City" value={form.city} onChange={v => set('city', v)} />
            <Inp label="State" value={form.state} onChange={v => set('state', v)} />
            <Inp label="ZIP" value={form.zip} onChange={v => set('zip', v)} />
          </div>
        </Section>

        <Section title="Emergency Contact">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Inp label="Name" value={form.emergencyContactName} onChange={v => set('emergencyContactName', v)} />
            <Inp label="Phone" value={form.emergencyContactPhone} onChange={v => set('emergencyContactPhone', v)} type="tel" />
          </div>
          <Inp label="Relationship" value={form.emergencyContactRelation} onChange={v => set('emergencyContactRelation', v)} />
        </Section>

        <Section title="Health History">
          <TextArea label="Current Medications (list all, or 'None')" value={form.currentMedications} onChange={v => set('currentMedications', v)} />
          <TextArea label="Allergies" value={form.allergies} onChange={v => set('allergies', v)} />
          <TextArea label="Medical Conditions" value={form.medicalConditions} onChange={v => set('medicalConditions', v)} />
          <TextArea label="Previous Counseling / Therapy Experience" value={form.previousCounseling} onChange={v => set('previousCounseling', v)} />
        </Section>

        <Section title="Session Goals">
          <TextArea label="What brings you in? (primary concern)" value={form.primaryConcern} onChange={v => set('primaryConcern', v)} rows={4} />
          <TextArea label="What are your goals for counseling?" value={form.goals} onChange={v => set('goals', v)} rows={3} />
        </Section>

        <Section title="Consent">
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', fontSize: 13, color: '#2C2416', lineHeight: 1.5 }}>
            <input type="checkbox" checked={form.consentAcknowledged} onChange={e => set('consentAcknowledged', e.target.checked)} style={{ marginTop: 3 }} />
            <span>
              I acknowledge that the information provided is accurate to the best of my knowledge. I understand that this information is confidential, protected under HIPAA, and will only be shared with my counselor.
            </span>
          </label>
        </Section>

        <button type="submit" disabled={submitting} style={{
          width: '100%',
          background: '#C45A1A',
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          padding: '14px 24px',
          borderRadius: 10,
          border: 'none',
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.7 : 1,
          marginTop: 8,
        }}>
          {submitting ? 'Submitting...' : 'Submit Health Information'}
        </button>
      </form>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F2E8', minHeight: '100vh', color: '#2C2416' }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400..600&display=swap');` }} />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>{children}</div>
    </div>
  )
}

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: 'center', padding: '60px 0' }}>{children}</div>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#FDFAF4', border: '1px solid #E2D9C5', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: '#2C2416', marginTop: 0, marginBottom: 14 }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  )
}

function Inp({ label, value, onChange, type, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label style={labelSt}>{label}</label>
      <input type={type || 'text'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inpSt} />
    </div>
  )
}

function TextArea({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label style={labelSt}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows || 2} style={{ ...inpSt, resize: 'vertical', minHeight: 50 }} />
    </div>
  )
}

const labelSt: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#7A6E5C',
  display: 'block',
  marginBottom: 4,
}

const inpSt: React.CSSProperties = {
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
