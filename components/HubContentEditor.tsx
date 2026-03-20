'use client'

import type { HubContent } from '@/lib/hubContent'
import { DEFAULT_HUB_CONTENT } from '@/lib/hubContent'

const inp: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #E2D9C5',
  background: '#F7F2E8',
  fontSize: 13,
  color: '#2C2416',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: "'DM Sans', sans-serif",
}

const addBtn: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#3E4A27',
  background: '#fff',
  border: '1px dashed #3E4A27',
  padding: '8px 12px',
  borderRadius: 8,
  cursor: 'pointer',
  marginTop: 8,
}

const sub = { fontSize: 12, color: '#7A6E5C', margin: '0 0 8px' } as React.CSSProperties

/** Icons/emojis are fixed in defaults — not editable in admin. */
const readOnlyEmoji: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 42,
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #D5CCB8',
  background: '#EDE8DC',
  fontSize: 20,
  lineHeight: 1,
  color: '#2C2416',
  boxSizing: 'border-box',
  userSelect: 'none',
  cursor: 'default',
}

function ReadOnlyEmoji({ value }: { value: string }) {
  return <span style={readOnlyEmoji}>{value.trim() ? value : '—'}</span>
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#FDFBF7', border: '1px solid #E2D9C5', borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#3E4A27', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}

export default function HubContentEditor({ content, onChange }: { content: HubContent; onChange: (c: HubContent) => void }) {
  const set = (patch: Partial<HubContent>) => onChange({ ...content, ...patch })

  return (
    <div>

      <Box title="Completion banners">
        <p style={sub}>Shown when a checklist is fully checked.</p>
        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 4 }}>Onboarding complete message</label>
        <input style={{ ...inp, marginBottom: 12 }} value={content.completionMessages.onboardComplete} onChange={e => set({ completionMessages: { ...content.completionMessages, onboardComplete: e.target.value } })} />
        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 4 }}>Essentials complete message</label>
        <input style={inp} value={content.completionMessages.essentialsComplete} onChange={e => set({ completionMessages: { ...content.completionMessages, essentialsComplete: e.target.value } })} />
      </Box>

      <Box title="Top of hub — Quick Start video (hero)">
        <p style={{ ...sub, marginTop: -4 }}>This is the first video strip at the <strong>top</strong> of the page — not the cream 💡 “Watch This” card (that’s in Step 1 → Lightbulb card).</p>
        <input style={{ ...inp, marginBottom: 8 }} placeholder="Video URL" value={content.quickStart.url} onChange={e => set({ quickStart: { ...content.quickStart, url: e.target.value } })} />
        <input style={{ ...inp, marginBottom: 8 }} placeholder="Tagline (e.g. Start here — 7 min)" value={content.quickStart.tagline} onChange={e => set({ quickStart: { ...content.quickStart, tagline: e.target.value } })} />
        <input style={inp} placeholder="Title" value={content.quickStart.title} onChange={e => set({ quickStart: { ...content.quickStart, title: e.target.value } })} />
      </Box>

      <Box title="Onboarding checklist (Before You Start)">
        {content.onboarding.map((row, i) => (
          <div key={i} style={{ borderBottom: '1px solid #E2D9C5', paddingBottom: 12, marginBottom: 12 }}>
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Title" value={row.label} onChange={e => {
              const onboarding = [...content.onboarding]; onboarding[i] = { ...row, label: e.target.value }; set({ onboarding })
            }} />
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Subtitle (optional)" value={row.sub || ''} onChange={e => {
              const onboarding = [...content.onboarding]; onboarding[i] = { ...row, sub: e.target.value }; set({ onboarding })
            }} />
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Button label (e.g. Watch →)" value={row.linkText || ''} onChange={e => {
              const onboarding = [...content.onboarding]; onboarding[i] = { ...row, linkText: e.target.value }; set({ onboarding })
            }} />
            <input style={inp} placeholder="Button URL" value={row.linkUrl || ''} onChange={e => {
              const onboarding = [...content.onboarding]; onboarding[i] = { ...row, linkUrl: e.target.value }; set({ onboarding })
            }} />
            <button type="button" onClick={() => set({ onboarding: content.onboarding.filter((_, j) => j !== i) })} style={{ fontSize: 11, marginTop: 8, color: '#8B2942', background: 'none', border: '1px solid #E2D9C5', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Remove step</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => set({ onboarding: [...content.onboarding, { label: 'New step' }] })}>+ Add onboarding step</button>
      </Box>

      <Box title="Program essentials checklist">
        {content.essentials.map((row, i) => (
          <div key={i} style={{ borderBottom: '1px solid #E2D9C5', paddingBottom: 12, marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 4 }}>Icon (read-only)</label>
            <div style={{ marginBottom: 8, maxWidth: 72 }}><ReadOnlyEmoji value={row.emoji || ''} /></div>
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Title" value={row.label} onChange={e => {
              const essentials = [...content.essentials]; essentials[i] = { ...row, label: e.target.value }; set({ essentials })
            }} />
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Subtitle" value={row.sub || ''} onChange={e => {
              const essentials = [...content.essentials]; essentials[i] = { ...row, sub: e.target.value }; set({ essentials })
            }} />
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Button label" value={row.linkText || ''} onChange={e => {
              const essentials = [...content.essentials]; essentials[i] = { ...row, linkText: e.target.value }; set({ essentials })
            }} />
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Button URL" value={row.linkUrl || ''} onChange={e => {
              const essentials = [...content.essentials]; essentials[i] = { ...row, linkUrl: e.target.value }; set({ essentials })
            }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!row.outlineButton} onChange={e => {
                const essentials = [...content.essentials]; essentials[i] = { ...row, outlineButton: e.target.checked }; set({ essentials })
              }} />
              Outline button style
            </label>
            <button type="button" onClick={() => set({ essentials: content.essentials.filter((_, j) => j !== i) })} style={{ fontSize: 11, marginTop: 8, color: '#8B2942', background: 'none', border: '1px solid #E2D9C5', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => set({ essentials: [...content.essentials, { label: 'New item' }] })}>+ Add essential item</button>
      </Box>

      <Box title="Reference guides (PDF links)">
        {content.guides.map((g, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <ReadOnlyEmoji value={g.emoji} />
            <input style={inp} placeholder="Name" value={g.name} onChange={e => { const guides = [...content.guides]; guides[i] = { ...g, name: e.target.value }; set({ guides }) }} />
            <input style={inp} placeholder="URL" value={g.url} onChange={e => { const guides = [...content.guides]; guides[i] = { ...g, url: e.target.value }; set({ guides }) }} />
            <button type="button" onClick={() => set({ guides: content.guides.filter((_, j) => j !== i) })} style={{ fontSize: 11, color: '#3E4A27', border: '1px solid #E2D9C5', borderRadius: 6, padding: '8px', background: '#fff', cursor: 'pointer' }}>✕</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => set({ guides: [...content.guides, { emoji: '📄', name: 'New guide', url: 'https://' }] })}>+ Add guide</button>
      </Box>

      <Box title="Metabolic reset tips">
        {content.tips.map((t, i) => (
          <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #E2D9C5' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8, marginBottom: 6 }}>
              <ReadOnlyEmoji value={t.emoji} />
              <input style={inp} placeholder="Title" value={t.title} onChange={e => { const tips = [...content.tips]; tips[i] = { ...t, title: e.target.value }; set({ tips }) }} />
            </div>
            <textarea style={{ ...inp, minHeight: 52, marginBottom: 6 }} placeholder="Description" value={t.desc} onChange={e => { const tips = [...content.tips]; tips[i] = { ...t, desc: e.target.value }; set({ tips }) }} />
            <input style={inp} placeholder="URL" value={t.url} onChange={e => { const tips = [...content.tips]; tips[i] = { ...t, url: e.target.value }; set({ tips }) }} />
            <button type="button" onClick={() => set({ tips: content.tips.filter((_, j) => j !== i) })} style={{ fontSize: 11, marginTop: 6, color: '#8B2942', background: 'none', border: '1px solid #E2D9C5', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => set({ tips: [...content.tips, { emoji: '💡', title: 'New tip', desc: '', url: 'https://' }] })}>+ Add tip</button>
      </Box>

      <Box title="Daily videos — Night Before card">
        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 4 }}>Icon (read-only)</label>
        <div style={{ marginBottom: 8, maxWidth: 72 }}><ReadOnlyEmoji value={content.nightBefore.emoji} /></div>
        <input style={{ ...inp, marginBottom: 8 }} placeholder="Tagline" value={content.nightBefore.tagline} onChange={e => set({ nightBefore: { ...content.nightBefore, tagline: e.target.value } })} />
        <input style={{ ...inp, marginBottom: 8 }} placeholder="Title" value={content.nightBefore.title} onChange={e => set({ nightBefore: { ...content.nightBefore, title: e.target.value } })} />
        <textarea style={{ ...inp, minHeight: 56, marginBottom: 8 }} placeholder="Subtitle" value={content.nightBefore.sub} onChange={e => set({ nightBefore: { ...content.nightBefore, sub: e.target.value } })} />
        <input style={inp} placeholder="URL" value={content.nightBefore.url} onChange={e => set({ nightBefore: { ...content.nightBefore, url: e.target.value } })} />
      </Box>

      <Box title="Daily videos — Day grid (Day 1–8)">
        {content.dailyVideoDays.map((d, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input style={inp} placeholder="Day" value={d.day} onChange={e => { const dailyVideoDays = [...content.dailyVideoDays]; dailyVideoDays[i] = { ...d, day: e.target.value }; set({ dailyVideoDays }) }} />
            <input style={inp} placeholder="Label" value={d.label} onChange={e => { const dailyVideoDays = [...content.dailyVideoDays]; dailyVideoDays[i] = { ...d, label: e.target.value }; set({ dailyVideoDays }) }} />
            <input style={inp} placeholder="URL" value={d.url} onChange={e => { const dailyVideoDays = [...content.dailyVideoDays]; dailyVideoDays[i] = { ...d, url: e.target.value }; set({ dailyVideoDays }) }} />
            <button type="button" onClick={() => set({ dailyVideoDays: content.dailyVideoDays.filter((_, j) => j !== i) })} style={{ fontSize: 11, border: '1px solid #E2D9C5', borderRadius: 6, padding: '8px', background: '#fff', cursor: 'pointer' }}>✕</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => set({ dailyVideoDays: [...content.dailyVideoDays, { day: 'Day', label: 'Label', url: 'https://' }] })}>+ Add day</button>
      </Box>

      <Box title="Account — How to edit your order">
        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 4 }}>Card icon (read-only)</label>
        <div style={{ marginBottom: 8, maxWidth: 72 }}><ReadOnlyEmoji value={content.orderEdit.icon} /></div>
        <input style={{ ...inp, marginBottom: 8 }} placeholder="Card title" value={content.orderEdit.title} onChange={e => set({ orderEdit: { ...content.orderEdit, title: e.target.value } })} />
        <input style={{ ...inp, marginBottom: 8 }} placeholder="Subtitle" value={content.orderEdit.sub} onChange={e => set({ orderEdit: { ...content.orderEdit, sub: e.target.value } })} />
        <input style={{ ...inp, marginBottom: 8 }} placeholder="Callout text before video link" value={content.orderEdit.calloutLead} onChange={e => set({ orderEdit: { ...content.orderEdit, calloutLead: e.target.value } })} />
        <input style={{ ...inp, marginBottom: 8 }} placeholder="Video URL" value={content.orderEdit.videoUrl} onChange={e => set({ orderEdit: { ...content.orderEdit, videoUrl: e.target.value } })} />
        <input style={{ ...inp, marginBottom: 12 }} placeholder="Video link text" value={content.orderEdit.videoLinkText} onChange={e => set({ orderEdit: { ...content.orderEdit, videoLinkText: e.target.value } })} />
        <p style={{ fontSize: 12, fontWeight: 600, color: '#7A6E5C' }}>Numbered steps</p>
        {content.orderEdit.steps.map((step, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <input style={{ ...inp, marginBottom: 4 }} placeholder={`Step ${i + 1} title`} value={step.title} onChange={e => {
              const steps = [...content.orderEdit.steps]; steps[i] = { ...step, title: e.target.value }; set({ orderEdit: { ...content.orderEdit, steps } })
            }} />
            <textarea style={{ ...inp, minHeight: 44 }} placeholder="Step body" value={step.body} onChange={e => {
              const steps = [...content.orderEdit.steps]; steps[i] = { ...step, body: e.target.value }; set({ orderEdit: { ...content.orderEdit, steps } })
            }} />
            <button type="button" onClick={() => set({ orderEdit: { ...content.orderEdit, steps: content.orderEdit.steps.filter((_, j) => j !== i) } })} style={{ fontSize: 11, marginTop: 4, cursor: 'pointer' }}>Remove step</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => set({ orderEdit: { ...content.orderEdit, steps: [...content.orderEdit.steps, { title: '', body: '' }] } })}>+ Add step</button>
      </Box>

      <Box title="Account — Referral program card">
        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 4 }}>Card icon (read-only)</label>
        <div style={{ marginBottom: 8, maxWidth: 72 }}><ReadOnlyEmoji value={content.referral.icon} /></div>
        <input style={{ ...inp, marginBottom: 8 }} placeholder="Title" value={content.referral.title} onChange={e => set({ referral: { ...content.referral, title: e.target.value } })} />
        <input style={{ ...inp, marginBottom: 12 }} placeholder="Subtitle" value={content.referral.sub} onChange={e => set({ referral: { ...content.referral, sub: e.target.value } })} />
        <p style={{ fontSize: 12, fontWeight: 600, color: '#7A6E5C' }}>Steps (numbered)</p>
        {content.referral.steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <input style={{ ...inp, flex: 1 }} value={s} onChange={e => {
              const steps = [...content.referral.steps]; steps[i] = e.target.value; set({ referral: { ...content.referral, steps } })
            }} />
            <button type="button" onClick={() => set({ referral: { ...content.referral, steps: content.referral.steps.filter((_, j) => j !== i) } })} style={{ padding: '8px 10px', cursor: 'pointer' }}>✕</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => set({ referral: { ...content.referral, steps: [...content.referral.steps, ''] } })}>+ Add step</button>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#7A6E5C', marginTop: 16 }}>Warning lines (✕)</p>
        {content.referral.warnings.map((w, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <input style={{ ...inp, flex: 1 }} value={w} onChange={e => {
              const warnings = [...content.referral.warnings]; warnings[i] = e.target.value; set({ referral: { ...content.referral, warnings } })
            }} />
            <button type="button" onClick={() => set({ referral: { ...content.referral, warnings: content.referral.warnings.filter((_, j) => j !== i) } })} style={{ padding: '8px 10px', cursor: 'pointer' }}>✕</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => set({ referral: { ...content.referral, warnings: [...content.referral.warnings, ''] } })}>+ Add warning</button>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#7A6E5C', marginTop: 16 }}>Success note (✓)</p>
        <input style={inp} value={content.referral.successNote} onChange={e => set({ referral: { ...content.referral, successNote: e.target.value } })} />
      </Box>

      <button
        type="button"
        onClick={() => onChange(JSON.parse(JSON.stringify(DEFAULT_HUB_CONTENT)) as HubContent)}
        style={{ fontSize: 11, fontWeight: 600, color: '#7A6E5C', background: 'none', border: '1px solid #E2D9C5', padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}>
        Reset all hub content to defaults
      </button>
    </div>
  )
}
