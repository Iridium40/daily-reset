'use client'

import { useState } from 'react'
import type { HubLayout, HubActionButton, HubWatchThisSection } from '@/lib/hubLayout'
import { DEFAULT_HUB_LAYOUT } from '@/lib/hubLayout'
import type { HubContent } from '@/lib/hubContent'
import { DEFAULT_HUB_CONTENT } from '@/lib/hubContent'

export type AdminZoomCall = {
  id: string; title: string; zoomLink: string
  passcode: string; schedule: string; meetingId: string
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid #E2D9C5', background: '#F7F2E8',
  fontSize: 13, color: '#2C2416', outline: 'none',
  boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
}

const addBtn: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#3E4A27', background: '#fff',
  border: '1px dashed #3E4A27', padding: '8px 12px', borderRadius: 8,
  cursor: 'pointer', marginTop: 8,
}

const readOnlyEmojiStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '100%', minHeight: 42, padding: '10px 12px', borderRadius: 8,
  border: '1px solid #D5CCB8', background: '#EDE8DC', fontSize: 20,
  lineHeight: 1, color: '#2C2416', boxSizing: 'border-box',
  userSelect: 'none', cursor: 'default',
}

function ReadOnlyEmoji({ value }: { value: string }) {
  return <span style={readOnlyEmojiStyle}>{value.trim() ? value : '—'}</span>
}

function Label({ text }: { text: string }) {
  return <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 6 }}>{text}</label>
}

function Divider({ text }: { text: string }) {
  return <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9E9484', marginTop: 22, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #E8E2D6' }}>{text}</div>
}

function GroupedSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border: '1px solid #D8CDB8', borderRadius: 12, overflow: 'hidden', marginBottom: 14, background: '#FDFBF7' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer', background: open ? '#F0E8D8' : '#FDFBF7',
          borderBottom: open ? '1px solid #E2D9C5' : 'none',
          userSelect: 'none', transition: 'background 0.15s',
        }}
      >
        <span style={{ fontSize: 11, color: '#888', transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>▶</span>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#3E4A27' }}>{title}</div>
      </div>
      {open && <div style={{ padding: 16 }}>{children}</div>}
    </div>
  )
}

function ButtonEditor({ buttons, onChange }: { buttons: HubActionButton[]; onChange: (b: HubActionButton[]) => void }) {
  return (
    <div style={{ marginTop: 8 }}>
      <Label text="Action buttons (optional)" />
      {buttons.map((b, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <input style={inp} placeholder="Label" value={b.label} onChange={e => { const n = [...buttons]; n[i] = { ...n[i], label: e.target.value }; onChange(n) }} />
          <input style={inp} placeholder="https://..." value={b.url} onChange={e => { const n = [...buttons]; n[i] = { ...n[i], url: e.target.value }; onChange(n) }} />
          <button type="button" onClick={() => onChange(buttons.filter((_, j) => j !== i))} style={{ fontSize: 11, fontWeight: 600, color: '#3E4A27', background: 'none', border: '1px solid #E2D9C5', padding: '8px 10px', borderRadius: 6, cursor: 'pointer' }}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...buttons, { label: '', url: '' }])} style={addBtn}>+ Add button</button>
    </div>
  )
}

type Props = {
  layout: HubLayout
  onLayoutChange: (l: HubLayout) => void
  content: HubContent
  onContentChange: (c: HubContent) => void
  zoomCalls: AdminZoomCall[]
  onZoomCallChange: (id: string, field: keyof AdminZoomCall, value: string) => void
  onDeleteZoomCall: (id: string) => void
  onAddZoomCall: () => void
  zoomRecordingsUrl: string
  onZoomRecordingsUrlChange: (url: string) => void
  accent: string
  onAccent: string
}

export default function HubUnifiedEditor({
  layout, onLayoutChange,
  content, onContentChange,
  zoomCalls, onZoomCallChange, onDeleteZoomCall, onAddZoomCall,
  zoomRecordingsUrl, onZoomRecordingsUrlChange,
  accent, onAccent,
}: Props) {
  const setL = (patch: Partial<HubLayout>) => onLayoutChange({ ...layout, ...patch })
  const setC = (patch: Partial<HubContent>) => onContentChange({ ...content, ...patch })
  const setWatch = (w: HubWatchThisSection) => setL({ watchThis: w })

  return (
    <div>

      {/* ── 1. Top Navigation ──────────────────────────────────── */}
      <GroupedSection title="Top navigation" defaultOpen={false}>
        <p style={{ fontSize: 12, color: '#7A6E5C', margin: '0 0 12px' }}>
          Use anchors like <code style={{ fontSize: 11 }}>#mm-daily</code> for in-page links, or full URLs for external pages.
        </p>
        {layout.nav.map((item, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input style={inp} placeholder="Label" value={item.label} onChange={e => { const nav = [...layout.nav]; nav[i] = { ...nav[i], label: e.target.value }; setL({ nav }) }} />
            <input style={inp} placeholder="#mm-daily or https://..." value={item.href} onChange={e => { const nav = [...layout.nav]; nav[i] = { ...nav[i], href: e.target.value }; setL({ nav }) }} />
            <button type="button" onClick={() => setL({ nav: layout.nav.filter((_, j) => j !== i) })} style={{ fontSize: 11, fontWeight: 600, color: '#3E4A27', background: 'none', border: '1px solid #E2D9C5', padding: '8px 10px', borderRadius: 6, cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => setL({ nav: [...layout.nav, { label: '', href: '' }] })} style={addBtn}>+ Add nav link</button>
      </GroupedSection>

      {/* ── 2. Quick Start Hero ─────────────────────────────────── */}
      <GroupedSection title="Quick Start hero (top of hub)" defaultOpen={false}>
        <p style={{ fontSize: 12, color: '#7A6E5C', margin: '0 0 12px' }}>The first video strip at the very top of the page.</p>
        <Label text="Video URL" />
        <input style={{ ...inp, marginBottom: 10 }} value={content.quickStart.url} onChange={e => setC({ quickStart: { ...content.quickStart, url: e.target.value } })} />
        <Label text="Tagline" />
        <input style={{ ...inp, marginBottom: 10 }} placeholder="e.g. Start here — 7 min" value={content.quickStart.tagline} onChange={e => setC({ quickStart: { ...content.quickStart, tagline: e.target.value } })} />
        <Label text="Title" />
        <input style={inp} value={content.quickStart.title} onChange={e => setC({ quickStart: { ...content.quickStart, title: e.target.value } })} />
      </GroupedSection>

      {/* ── 3. Onboarding Checklist ─────────────────────────────── */}
      <GroupedSection title="Onboarding checklist">
        <Divider text="Section heading & buttons" />
        <Label text="Section label (small caps line)" />
        <input style={{ ...inp, marginBottom: 10 }} value={layout.onboarding.sectionTitle} onChange={e => setL({ onboarding: { ...layout.onboarding, sectionTitle: e.target.value } })} />
        <Label text="Card title" />
        <input style={{ ...inp, marginBottom: 10 }} value={layout.onboarding.innerTitle || ''} onChange={e => setL({ onboarding: { ...layout.onboarding, innerTitle: e.target.value } })} />
        <ButtonEditor buttons={layout.onboarding.buttons} onChange={buttons => setL({ onboarding: { ...layout.onboarding, buttons } })} />

        <Divider text="Completion banner" />
        <Label text="Message when all steps are checked" />
        <input style={inp} value={content.completionMessages.onboardComplete} onChange={e => setC({ completionMessages: { ...content.completionMessages, onboardComplete: e.target.value } })} />

        <Divider text="Checklist items" />
        {content.onboarding.map((row, i) => (
          <div key={i} style={{ borderBottom: '1px solid #E2D9C5', paddingBottom: 12, marginBottom: 12 }}>
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Title" value={row.label} onChange={e => {
              const onboarding = [...content.onboarding]; onboarding[i] = { ...row, label: e.target.value }; setC({ onboarding })
            }} />
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Subtitle (optional)" value={row.sub || ''} onChange={e => {
              const onboarding = [...content.onboarding]; onboarding[i] = { ...row, sub: e.target.value }; setC({ onboarding })
            }} />
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Button label (e.g. Watch →)" value={row.linkText || ''} onChange={e => {
              const onboarding = [...content.onboarding]; onboarding[i] = { ...row, linkText: e.target.value }; setC({ onboarding })
            }} />
            <input style={inp} placeholder="Button URL" value={row.linkUrl || ''} onChange={e => {
              const onboarding = [...content.onboarding]; onboarding[i] = { ...row, linkUrl: e.target.value }; setC({ onboarding })
            }} />
            <button type="button" onClick={() => setC({ onboarding: content.onboarding.filter((_, j) => j !== i) })} style={{ fontSize: 11, marginTop: 8, color: '#8B2942', background: 'none', border: '1px solid #E2D9C5', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Remove step</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => setC({ onboarding: [...content.onboarding, { label: 'New step' }] })}>+ Add onboarding step</button>
      </GroupedSection>

      {/* ── 4. Program Essentials ───────────────────────────────── */}
      <GroupedSection title="Program essentials">
        <Divider text="Section heading & buttons" />
        <Label text="Section label (small caps line)" />
        <input style={{ ...inp, marginBottom: 10 }} value={layout.essentials.sectionTitle} onChange={e => setL({ essentials: { ...layout.essentials, sectionTitle: e.target.value } })} />
        <Label text="Card title" />
        <input style={{ ...inp, marginBottom: 10 }} value={layout.essentials.innerTitle || ''} onChange={e => setL({ essentials: { ...layout.essentials, innerTitle: e.target.value } })} />
        <ButtonEditor buttons={layout.essentials.buttons} onChange={buttons => setL({ essentials: { ...layout.essentials, buttons } })} />

        <Divider text="Completion banner" />
        <Label text="Message when all items are checked" />
        <input style={inp} value={content.completionMessages.essentialsComplete} onChange={e => setC({ completionMessages: { ...content.completionMessages, essentialsComplete: e.target.value } })} />

        <Divider text="Checklist items" />
        {content.essentials.map((row, i) => (
          <div key={i} style={{ borderBottom: '1px solid #E2D9C5', paddingBottom: 12, marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 4 }}>Icon (read-only)</label>
            <div style={{ marginBottom: 8, maxWidth: 72 }}><ReadOnlyEmoji value={row.emoji || ''} /></div>
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Title" value={row.label} onChange={e => {
              const essentials = [...content.essentials]; essentials[i] = { ...row, label: e.target.value }; setC({ essentials })
            }} />
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Subtitle" value={row.sub || ''} onChange={e => {
              const essentials = [...content.essentials]; essentials[i] = { ...row, sub: e.target.value }; setC({ essentials })
            }} />
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Button label" value={row.linkText || ''} onChange={e => {
              const essentials = [...content.essentials]; essentials[i] = { ...row, linkText: e.target.value }; setC({ essentials })
            }} />
            <input style={{ ...inp, marginBottom: 6 }} placeholder="Button URL" value={row.linkUrl || ''} onChange={e => {
              const essentials = [...content.essentials]; essentials[i] = { ...row, linkUrl: e.target.value }; setC({ essentials })
            }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!row.outlineButton} onChange={e => {
                const essentials = [...content.essentials]; essentials[i] = { ...row, outlineButton: e.target.checked }; setC({ essentials })
              }} />
              Outline button style
            </label>
            <button type="button" onClick={() => setC({ essentials: content.essentials.filter((_, j) => j !== i) })} style={{ fontSize: 11, marginTop: 8, color: '#8B2942', background: 'none', border: '1px solid #E2D9C5', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => setC({ essentials: [...content.essentials, { label: 'New item' }] })}>+ Add essential item</button>
      </GroupedSection>

      {/* ── 5. Community Zoom ──────────────────────────────────── */}
      <GroupedSection title="Community Zoom calls" defaultOpen={false}>
        <Divider text="Section heading & buttons" />
        <Label text="Section label" />
        <input style={{ ...inp, marginBottom: 10 }} value={layout.communityZoom.sectionTitle} onChange={e => setL({ communityZoom: { ...layout.communityZoom, sectionTitle: e.target.value } })} />
        <ButtonEditor buttons={layout.communityZoom.buttons} onChange={buttons => setL({ communityZoom: { ...layout.communityZoom, buttons } })} />

        <Divider text="Zoom meetings" />
        {zoomCalls.map((zc, idx) => (
          <div key={zc.id} style={{ background: '#fff', border: '1px solid #E2D9C5', borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#3E4A27' }}>Meeting {idx + 1}</div>
              <button type="button" onClick={() => onDeleteZoomCall(zc.id)} style={{ fontSize: 11, fontWeight: 600, color: '#C45A1A', background: 'none', border: '1px solid #C45A1A33', padding: '4px 12px', borderRadius: 6, cursor: 'pointer' }}>Remove</button>
            </div>
            <Label text="Title" />
            <input style={{ ...inp, marginBottom: 8 }} value={zc.title} onChange={e => onZoomCallChange(zc.id, 'title', e.target.value)} placeholder="e.g. Monday Night Zoom" />
            <Label text="Zoom join link" />
            <input style={{ ...inp, marginBottom: 8 }} value={zc.zoomLink} onChange={e => onZoomCallChange(zc.id, 'zoomLink', e.target.value)} placeholder="https://zoom.us/j/..." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><Label text="Meeting ID" /><input style={inp} value={zc.meetingId} onChange={e => onZoomCallChange(zc.id, 'meetingId', e.target.value)} placeholder="815 630 1595" /></div>
              <div><Label text="Passcode" /><input style={inp} value={zc.passcode} onChange={e => onZoomCallChange(zc.id, 'passcode', e.target.value)} placeholder="abc123" /></div>
            </div>
            <div style={{ marginTop: 8 }}>
              <Label text="Schedule" />
              <input style={inp} value={zc.schedule} onChange={e => onZoomCallChange(zc.id, 'schedule', e.target.value)} placeholder="Every Monday 7pm CST · 8pm EST" />
            </div>
          </div>
        ))}
        <button type="button" onClick={onAddZoomCall} style={{ fontSize: 13, fontWeight: 600, color: onAccent, background: accent, border: `1px solid ${onAccent}33`, padding: '12px 0', borderRadius: 8, cursor: 'pointer', width: '100%', marginTop: 8, marginBottom: 12 }}>+ Add Zoom meeting</button>
        <Label text="Past recordings URL (shared)" />
        <input style={inp} value={zoomRecordingsUrl} onChange={e => onZoomRecordingsUrlChange(e.target.value)} placeholder="https://docs.google.com/document/d/..." />
      </GroupedSection>

      {/* ── 6. Reference Guides ────────────────────────────────── */}
      <GroupedSection title="Reference guides" defaultOpen={false}>
        <Divider text="Section heading & buttons" />
        <Label text="Section label" />
        <input style={{ ...inp, marginBottom: 10 }} value={layout.guides.sectionTitle} onChange={e => setL({ guides: { ...layout.guides, sectionTitle: e.target.value } })} />
        <ButtonEditor buttons={layout.guides.buttons} onChange={buttons => setL({ guides: { ...layout.guides, buttons } })} />

        <Divider text="Guide rows" />
        {content.guides.map((g, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <ReadOnlyEmoji value={g.emoji} />
            <input style={inp} placeholder="Name" value={g.name} onChange={e => { const guides = [...content.guides]; guides[i] = { ...g, name: e.target.value }; setC({ guides }) }} />
            <input style={inp} placeholder="URL" value={g.url} onChange={e => { const guides = [...content.guides]; guides[i] = { ...g, url: e.target.value }; setC({ guides }) }} />
            <button type="button" onClick={() => setC({ guides: content.guides.filter((_, j) => j !== i) })} style={{ fontSize: 11, color: '#3E4A27', border: '1px solid #E2D9C5', borderRadius: 6, padding: '8px', background: '#fff', cursor: 'pointer' }}>✕</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => setC({ guides: [...content.guides, { emoji: '📄', name: 'New guide', url: 'https://' }] })}>+ Add guide</button>
      </GroupedSection>

      {/* ── 7. Metabolic Reset Tips ────────────────────────────── */}
      <GroupedSection title="Metabolic reset tips" defaultOpen={false}>
        <Divider text="Section heading & buttons" />
        <Label text="Section label" />
        <input style={{ ...inp, marginBottom: 10 }} value={layout.tips.sectionTitle} onChange={e => setL({ tips: { ...layout.tips, sectionTitle: e.target.value } })} />
        <ButtonEditor buttons={layout.tips.buttons} onChange={buttons => setL({ tips: { ...layout.tips, buttons } })} />

        <Divider text="Tip rows" />
        {content.tips.map((t, i) => (
          <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #E2D9C5' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 8, marginBottom: 6 }}>
              <ReadOnlyEmoji value={t.emoji} />
              <input style={inp} placeholder="Title" value={t.title} onChange={e => { const tips = [...content.tips]; tips[i] = { ...t, title: e.target.value }; setC({ tips }) }} />
            </div>
            <textarea style={{ ...inp, minHeight: 52, marginBottom: 6 }} placeholder="Description" value={t.desc} onChange={e => { const tips = [...content.tips]; tips[i] = { ...t, desc: e.target.value }; setC({ tips }) }} />
            <input style={inp} placeholder="URL" value={t.url} onChange={e => { const tips = [...content.tips]; tips[i] = { ...t, url: e.target.value }; setC({ tips }) }} />
            <button type="button" onClick={() => setC({ tips: content.tips.filter((_, j) => j !== i) })} style={{ fontSize: 11, marginTop: 6, color: '#8B2942', background: 'none', border: '1px solid #E2D9C5', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => setC({ tips: [...content.tips, { emoji: '💡', title: 'New tip', desc: '', url: 'https://' }] })}>+ Add tip</button>
      </GroupedSection>

      {/* ── 8. Daily Videos ────────────────────────────────────── */}
      <GroupedSection title="Daily videos">
        <Divider text="Section heading & buttons" />
        <Label text="Section label" />
        <input style={{ ...inp, marginBottom: 10 }} value={layout.dailyVideos.sectionTitle} onChange={e => setL({ dailyVideos: { ...layout.dailyVideos, sectionTitle: e.target.value } })} />
        <ButtonEditor buttons={layout.dailyVideos.buttons} onChange={buttons => setL({ dailyVideos: { ...layout.dailyVideos, buttons } })} />

        <Divider text="Night Before card" />
        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 4 }}>Icon (read-only)</label>
        <div style={{ marginBottom: 8, maxWidth: 72 }}><ReadOnlyEmoji value={content.nightBefore.emoji} /></div>
        <Label text="Tagline" />
        <input style={{ ...inp, marginBottom: 8 }} value={content.nightBefore.tagline} onChange={e => setC({ nightBefore: { ...content.nightBefore, tagline: e.target.value } })} />
        <Label text="Title" />
        <input style={{ ...inp, marginBottom: 8 }} value={content.nightBefore.title} onChange={e => setC({ nightBefore: { ...content.nightBefore, title: e.target.value } })} />
        <Label text="Subtitle" />
        <textarea style={{ ...inp, minHeight: 56, marginBottom: 8 }} value={content.nightBefore.sub} onChange={e => setC({ nightBefore: { ...content.nightBefore, sub: e.target.value } })} />
        <Label text="URL" />
        <input style={inp} value={content.nightBefore.url} onChange={e => setC({ nightBefore: { ...content.nightBefore, url: e.target.value } })} />

        <Divider text="Day grid (Day 1–8)" />
        {content.dailyVideoDays.map((d, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input style={inp} placeholder="Day" value={d.day} onChange={e => { const dailyVideoDays = [...content.dailyVideoDays]; dailyVideoDays[i] = { ...d, day: e.target.value }; setC({ dailyVideoDays }) }} />
            <input style={inp} placeholder="Label" value={d.label} onChange={e => { const dailyVideoDays = [...content.dailyVideoDays]; dailyVideoDays[i] = { ...d, label: e.target.value }; setC({ dailyVideoDays }) }} />
            <input style={inp} placeholder="URL" value={d.url} onChange={e => { const dailyVideoDays = [...content.dailyVideoDays]; dailyVideoDays[i] = { ...d, url: e.target.value }; setC({ dailyVideoDays }) }} />
            <button type="button" onClick={() => setC({ dailyVideoDays: content.dailyVideoDays.filter((_, j) => j !== i) })} style={{ fontSize: 11, border: '1px solid #E2D9C5', borderRadius: 6, padding: '8px', background: '#fff', cursor: 'pointer' }}>✕</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => setC({ dailyVideoDays: [...content.dailyVideoDays, { day: 'Day', label: 'Label', url: 'https://' }] })}>+ Add day</button>
      </GroupedSection>

      {/* ── 9. "Watch This" / Mission Card ─────────────────────── */}
      <GroupedSection title={'💡 "Watch This" / mission card'} defaultOpen={false}>
        <p style={{ fontSize: 12, color: '#5C5346', margin: '0 0 14px', lineHeight: 1.55 }}>
          The wide cream card below the daily video grid. Not the Quick Start hero at the top.
        </p>
        <Label text="Divider above card (optional — leave empty to hide)" />
        <input style={{ ...inp, marginBottom: 10 }} value={layout.watchThis.sectionTitle} onChange={e => setWatch({ ...layout.watchThis, sectionTitle: e.target.value })} />
        <Label text="Small label above headline (e.g. Watch This)" />
        <input style={{ ...inp, marginBottom: 10 }} value={layout.watchThis.cardTagline} onChange={e => setWatch({ ...layout.watchThis, cardTagline: e.target.value })} />
        <Label text="Main headline" />
        <input style={{ ...inp, marginBottom: 10 }} value={layout.watchThis.cardTitle} onChange={e => setWatch({ ...layout.watchThis, cardTitle: e.target.value })} />
        <Label text="Link when clicked" />
        <input style={{ ...inp, marginBottom: 10 }} value={layout.watchThis.cardUrl} onChange={e => setWatch({ ...layout.watchThis, cardUrl: e.target.value })} />
        <ButtonEditor buttons={layout.watchThis.buttons} onChange={buttons => setWatch({ ...layout.watchThis, buttons })} />
      </GroupedSection>

      {/* ── 10. Account & Orders ───────────────────────────────── */}
      <GroupedSection title="Account & orders">
        <Divider text="Section heading & buttons" />
        <Label text="Section label" />
        <input style={{ ...inp, marginBottom: 10 }} value={layout.accountOrders.sectionTitle} onChange={e => setL({ accountOrders: { ...layout.accountOrders, sectionTitle: e.target.value } })} />
        <ButtonEditor buttons={layout.accountOrders.buttons} onChange={buttons => setL({ accountOrders: { ...layout.accountOrders, buttons } })} />

        <Divider text="How to edit your order" />
        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 4 }}>Card icon (read-only)</label>
        <div style={{ marginBottom: 8, maxWidth: 72 }}><ReadOnlyEmoji value={content.orderEdit.icon} /></div>
        <Label text="Card title" />
        <input style={{ ...inp, marginBottom: 8 }} value={content.orderEdit.title} onChange={e => setC({ orderEdit: { ...content.orderEdit, title: e.target.value } })} />
        <Label text="Subtitle" />
        <input style={{ ...inp, marginBottom: 8 }} value={content.orderEdit.sub} onChange={e => setC({ orderEdit: { ...content.orderEdit, sub: e.target.value } })} />
        <Label text="Callout text before video link" />
        <input style={{ ...inp, marginBottom: 8 }} value={content.orderEdit.calloutLead} onChange={e => setC({ orderEdit: { ...content.orderEdit, calloutLead: e.target.value } })} />
        <Label text="Video URL" />
        <input style={{ ...inp, marginBottom: 8 }} value={content.orderEdit.videoUrl} onChange={e => setC({ orderEdit: { ...content.orderEdit, videoUrl: e.target.value } })} />
        <Label text="Video link text" />
        <input style={{ ...inp, marginBottom: 12 }} value={content.orderEdit.videoLinkText} onChange={e => setC({ orderEdit: { ...content.orderEdit, videoLinkText: e.target.value } })} />
        <p style={{ fontSize: 12, fontWeight: 600, color: '#7A6E5C' }}>Numbered steps</p>
        {content.orderEdit.steps.map((step, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <input style={{ ...inp, marginBottom: 4 }} placeholder={`Step ${i + 1} title`} value={step.title} onChange={e => {
              const steps = [...content.orderEdit.steps]; steps[i] = { ...step, title: e.target.value }; setC({ orderEdit: { ...content.orderEdit, steps } })
            }} />
            <textarea style={{ ...inp, minHeight: 44 }} placeholder="Step body" value={step.body} onChange={e => {
              const steps = [...content.orderEdit.steps]; steps[i] = { ...step, body: e.target.value }; setC({ orderEdit: { ...content.orderEdit, steps } })
            }} />
            <button type="button" onClick={() => setC({ orderEdit: { ...content.orderEdit, steps: content.orderEdit.steps.filter((_, j) => j !== i) } })} style={{ fontSize: 11, marginTop: 4, cursor: 'pointer', color: '#8B2942', background: 'none', border: '1px solid #E2D9C5', padding: '6px 10px', borderRadius: 6 }}>Remove step</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => setC({ orderEdit: { ...content.orderEdit, steps: [...content.orderEdit.steps, { title: '', body: '' }] } })}>+ Add step</button>

        <Divider text="Referral program card" />
        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 4 }}>Card icon (read-only)</label>
        <div style={{ marginBottom: 8, maxWidth: 72 }}><ReadOnlyEmoji value={content.referral.icon} /></div>
        <Label text="Title" />
        <input style={{ ...inp, marginBottom: 8 }} value={content.referral.title} onChange={e => setC({ referral: { ...content.referral, title: e.target.value } })} />
        <Label text="Subtitle" />
        <input style={{ ...inp, marginBottom: 12 }} value={content.referral.sub} onChange={e => setC({ referral: { ...content.referral, sub: e.target.value } })} />
        <p style={{ fontSize: 12, fontWeight: 600, color: '#7A6E5C' }}>Steps (numbered)</p>
        {content.referral.steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <input style={{ ...inp, flex: 1 }} value={s} onChange={e => {
              const steps = [...content.referral.steps]; steps[i] = e.target.value; setC({ referral: { ...content.referral, steps } })
            }} />
            <button type="button" onClick={() => setC({ referral: { ...content.referral, steps: content.referral.steps.filter((_, j) => j !== i) } })} style={{ padding: '8px 10px', cursor: 'pointer' }}>✕</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => setC({ referral: { ...content.referral, steps: [...content.referral.steps, ''] } })}>+ Add step</button>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#7A6E5C', marginTop: 16 }}>Warning lines (✕)</p>
        {content.referral.warnings.map((w, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <input style={{ ...inp, flex: 1 }} value={w} onChange={e => {
              const warnings = [...content.referral.warnings]; warnings[i] = e.target.value; setC({ referral: { ...content.referral, warnings } })
            }} />
            <button type="button" onClick={() => setC({ referral: { ...content.referral, warnings: content.referral.warnings.filter((_, j) => j !== i) } })} style={{ padding: '8px 10px', cursor: 'pointer' }}>✕</button>
          </div>
        ))}
        <button type="button" style={addBtn} onClick={() => setC({ referral: { ...content.referral, warnings: [...content.referral.warnings, ''] } })}>+ Add warning</button>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#7A6E5C', marginTop: 16 }}>Success note (✓)</p>
        <input style={inp} value={content.referral.successNote} onChange={e => setC({ referral: { ...content.referral, successNote: e.target.value } })} />
      </GroupedSection>

      {/* ── Resets ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button type="button" onClick={() => onLayoutChange(JSON.parse(JSON.stringify(DEFAULT_HUB_LAYOUT)) as HubLayout)} style={{ fontSize: 11, fontWeight: 600, color: '#7A6E5C', background: 'none', border: '1px solid #E2D9C5', padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}>
          Reset section labels &amp; buttons
        </button>
        <button type="button" onClick={() => onContentChange(JSON.parse(JSON.stringify(DEFAULT_HUB_CONTENT)) as HubContent)} style={{ fontSize: 11, fontWeight: 600, color: '#7A6E5C', background: 'none', border: '1px solid #E2D9C5', padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}>
          Reset page content
        </button>
      </div>
    </div>
  )
}
