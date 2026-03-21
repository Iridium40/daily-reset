'use client'

import { useRouter } from 'next/navigation'

export default function BookLanding() {
  const router = useRouter()

  return (
    <PageShell>
      <div style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: '#2C2416', marginBottom: 8 }}>
          Book a Session
        </h1>
        <p style={{ fontSize: 15, color: '#7A6E5C', lineHeight: 1.6, marginBottom: 40 }}>
          We're glad you're here. Select an option below to schedule your counseling session.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button
            onClick={() => router.push('/book/new')}
            style={{
              background: '#C45A1A',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              padding: '18px 32px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span>I'm a New Client</span>
            <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.85 }}>First-time visit — in-person only, book 24 hours ahead</span>
          </button>

          <button
            onClick={() => router.push('/book/returning')}
            style={{
              background: '#3E4A27',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              padding: '18px 32px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span>I'm a Returning Client</span>
            <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.85 }}>Rebook with your counselor — in-person or virtual</span>
          </button>
        </div>
      </div>
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F7F2E8', minHeight: '100vh', color: '#2C2416' }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans:wght@400..600&display=swap');` }} />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 24px' }}>
        {children}
      </div>
    </div>
  )
}
