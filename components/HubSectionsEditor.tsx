'use client'

import type { HubActionButton, HubLayout, HubNavItem, HubStandardSection, HubWatchThisSection } from '@/lib/hubLayout'
import { DEFAULT_HUB_LAYOUT } from '@/lib/hubLayout'

/** Fixed admin UI colors — never use org accent here (light accents disappear on cream backgrounds). */
const addRowBtn: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#3E4A27',
  background: '#fff',
  border: '1px dashed #3E4A27',
  padding: '8px 12px',
  borderRadius: 8,
  cursor: 'pointer',
  marginTop: 4,
}

const inputStyle: React.CSSProperties = {
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

function ButtonEditor({ buttons, onChange }: { buttons: HubActionButton[]; onChange: (b: HubActionButton[]) => void }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A6E5C', marginBottom: 8 }}>Action buttons (optional)</div>
      {buttons.map((b, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <input style={inputStyle} placeholder="Button label" value={b.label} onChange={e => {
            const n = [...buttons]; n[i] = { ...n[i], label: e.target.value }; onChange(n)
          }} />
          <input style={inputStyle} placeholder="https://..." value={b.url} onChange={e => {
            const n = [...buttons]; n[i] = { ...n[i], url: e.target.value }; onChange(n)
          }} />
          <button type="button" onClick={() => onChange(buttons.filter((_, j) => j !== i))}
            style={{ fontSize: 11, fontWeight: 600, color: '#3E4A27', background: 'none', border: '1px solid #E2D9C5', padding: '8px 10px', borderRadius: 6, cursor: 'pointer' }}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...buttons, { label: '', url: '' }])} style={addRowBtn}>
        + Add button
      </button>
    </div>
  )
}

function StandardBlock({
  title,
  section,
  onChange,
  showInnerTitle,
  innerTitleHint,
}: {
  title: string
  section: HubStandardSection
  onChange: (s: HubStandardSection) => void
  showInnerTitle?: boolean
  innerTitleHint?: string
}) {
  return (
    <div style={{ background: '#FDFBF7', border: '1px solid #E2D9C5', borderRadius: 12, padding: 16, marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#3E4A27', marginBottom: 12 }}>{title}</div>
      <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 6 }}>Section label (small caps line)</label>
      <input style={{ ...inputStyle, marginBottom: 12 }} value={section.sectionTitle} onChange={e => onChange({ ...section, sectionTitle: e.target.value })} />
      {showInnerTitle && (
        <>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 6 }}>{innerTitleHint || 'Card heading'}</label>
          <input style={{ ...inputStyle, marginBottom: 12 }} value={section.innerTitle || ''} onChange={e => onChange({ ...section, innerTitle: e.target.value })} />
        </>
      )}
      <ButtonEditor buttons={section.buttons} onChange={buttons => onChange({ ...section, buttons })} />
    </div>
  )
}

function NavEditor({ nav, onChange }: { nav: HubNavItem[]; onChange: (n: HubNavItem[]) => void }) {
  return (
    <div style={{ background: '#FDFBF7', border: '1px solid #E2D9C5', borderRadius: 12, padding: 16, marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#3E4A27', marginBottom: 12 }}>Top navigation</div>
      <p style={{ fontSize: 12, color: '#7A6E5C', margin: '0 0 12px' }}>Use anchors like <code style={{ fontSize: 11 }}>#mm-daily</code> for in-page links, or full URLs for external pages.</p>
      {nav.map((item, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <input style={inputStyle} placeholder="Label" value={item.label} onChange={e => {
            const n = [...nav]; n[i] = { ...n[i], label: e.target.value }; onChange(n)
          }} />
          <input style={inputStyle} placeholder="#mm-daily or https://..." value={item.href} onChange={e => {
            const n = [...nav]; n[i] = { ...n[i], href: e.target.value }; onChange(n)
          }} />
          <button type="button" onClick={() => onChange(nav.filter((_, j) => j !== i))}
            style={{ fontSize: 11, fontWeight: 600, color: '#3E4A27', background: 'none', border: '1px solid #E2D9C5', padding: '8px 10px', borderRadius: 6, cursor: 'pointer' }}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...nav, { label: '', href: '' }])} style={addRowBtn}>
        + Add nav link
      </button>
    </div>
  )
}

export default function HubSectionsEditor({ layout, onChange }: { layout: HubLayout; onChange: (l: HubLayout) => void }) {
  const setWatch = (w: HubWatchThisSection) => onChange({ ...layout, watchThis: w })

  return (
    <div>
      <NavEditor nav={layout.nav} onChange={nav => onChange({ ...layout, nav })} />

      <StandardBlock title="Onboarding checklist" section={layout.onboarding} showInnerTitle innerTitleHint="Checklist card title"
        onChange={onboarding => onChange({ ...layout, onboarding })} />

      <StandardBlock title="Program essentials" section={layout.essentials} showInnerTitle innerTitleHint="Checklist card title"
        onChange={essentials => onChange({ ...layout, essentials })} />

      <StandardBlock title="Community Zoom (section label only)" section={layout.communityZoom}
        onChange={communityZoom => onChange({ ...layout, communityZoom })} />

      <StandardBlock title="Reference guides" section={layout.guides}
        onChange={guides => onChange({ ...layout, guides })} />

      <StandardBlock title="Metabolic reset tips" section={layout.tips}
        onChange={tips => onChange({ ...layout, tips })} />

      <StandardBlock title="Daily videos" section={layout.dailyVideos}
        onChange={dailyVideos => onChange({ ...layout, dailyVideos })} />

      <div style={{ background: '#FDFBF7', border: '1px solid #E2D9C5', borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#3E4A27', marginBottom: 12 }}>Featured video card (“Watch This”)</div>
        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 6 }}>Section label (optional — leave empty to hide divider)</label>
        <input style={{ ...inputStyle, marginBottom: 12 }} value={layout.watchThis.sectionTitle} onChange={e => setWatch({ ...layout.watchThis, sectionTitle: e.target.value })} />
        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 6 }}>Tagline (small caps)</label>
        <input style={{ ...inputStyle, marginBottom: 12 }} value={layout.watchThis.cardTagline} onChange={e => setWatch({ ...layout.watchThis, cardTagline: e.target.value })} />
        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 6 }}>Card title</label>
        <input style={{ ...inputStyle, marginBottom: 12 }} value={layout.watchThis.cardTitle} onChange={e => setWatch({ ...layout.watchThis, cardTitle: e.target.value })} />
        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#7A6E5C', display: 'block', marginBottom: 6 }}>Video / link URL</label>
        <input style={{ ...inputStyle, marginBottom: 12 }} value={layout.watchThis.cardUrl} onChange={e => setWatch({ ...layout.watchThis, cardUrl: e.target.value })} />
        <ButtonEditor buttons={layout.watchThis.buttons} onChange={buttons => setWatch({ ...layout.watchThis, buttons })} />
      </div>

      <StandardBlock title="Account & orders" section={layout.accountOrders}
        onChange={accountOrders => onChange({ ...layout, accountOrders })} />

      <button type="button" onClick={() => onChange(JSON.parse(JSON.stringify(DEFAULT_HUB_LAYOUT)) as HubLayout)}
        style={{ fontSize: 11, fontWeight: 600, color: '#7A6E5C', background: 'none', border: '1px solid #E2D9C5', padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}>
        Reset all hub sections to defaults
      </button>
    </div>
  )
}
