'use client'

import { useState, useEffect, useMemo } from 'react'
import { useServerChecklist } from '@/lib/useServerChecklist'
import { parseHubLayout, type HubActionButton } from '@/lib/hubLayout'
import { parseHubContent, resolveOnboardingItems } from '@/lib/hubContent'

function contrastText(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#1A1A1A' : '#ffffff'
}

export type ZoomCall = {
  id: string; title: string; zoomLink: string; passcode: string | null
  schedule: string | null; meetingId: string | null
}

export type Org = {
  id: string; slug: string; name: string
  primaryColor: string; accentColor: string; welcomeMessage: string | null
  zoomRecordingsUrl: string | null; facebookUrl: string | null
  hubSectionsJson?: string | null
  hubContentJson?: string | null
  zoomCalls: ZoomCall[]
}

function SectionDivider({ label, id }: { label: string; id?: string }) {
  if (!label.trim()) return null
  return (
    <div id={id} style={{ margin:'48px 0 20px' }}>
      <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7A6E5C' }}>{label}</span>
    </div>
  )
}

function SectionActionButtons({ buttons, primary, onPrimary }: { buttons: HubActionButton[]; primary: string; onPrimary: string }) {
  if (!buttons.length) return null
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16 }}>
      {buttons.map((b, i) => (
        <a key={`${b.url}-${i}`} href={b.url} target="_blank" rel="noreferrer"
          style={{ flex:'1 1 160px', textAlign:'center', background:primary, color:onPrimary, fontSize:14, fontWeight:600, padding:'12px 16px', borderRadius:8, textDecoration:'none' }}>
          {b.label}
        </a>
      ))}
    </div>
  )
}


function CompletionBanner({ label, onReset, color, textColor }: { label: string; onReset: () => void; color: string; textColor: string }) {
  return (
    <div style={{ background:color, borderRadius:12, padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', margin:'12px 24px', gap:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:20 }}>🎉</span>
        <span style={{ color:textColor, fontWeight:600, fontSize:14 }}>{label}</span>
      </div>
      <button onClick={onReset} style={{ background:'transparent', border:`1px solid ${textColor}44`, color:textColor, fontSize:11, fontWeight:600, padding:'6px 14px', borderRadius:8, cursor:'pointer' }}>Reset</button>
    </div>
  )
}

function Card({ icon, title, sub, children, defaultOpen=false, id, brandColor='#1A1A1A' }: { icon:string; title:string; sub?:React.ReactNode; children:React.ReactNode; defaultOpen?:boolean; id?:string; brandColor?:string }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div id={id} style={{ background:'#fff', borderRadius:16, overflow:'hidden', marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
      <div onClick={() => setOpen(o=>!o)} style={{ padding:'20px 24px', display:'flex', alignItems:'center', gap:14, cursor:'pointer', userSelect:'none' }}>
        <span style={{ width:44, height:44, borderRadius:12, background:'#F5F1EA', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{icon}</span>
        <div style={{ flex:1 }}>
          {sub && <div style={{ fontSize:12, color:'#888', marginBottom:2 }}>{sub}</div>}
          <div style={{ fontWeight:700, fontSize:16, color:brandColor }}>{title}</div>
        </div>
        <span style={{ fontSize:13, color:'#888', display:'inline-block', transition:'transform 0.25s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </div>
      {open && <div style={{ padding:'4px 24px 20px', borderTop:'1px solid #F0EBE1' }}>{children}</div>}
    </div>
  )
}

function CheckItem({ emoji, label, sub, link, checked, onToggle, outlineBtn, brandColor, brandTextColor }: { emoji?:string; label:string; sub?:string; link?:{href:string;text:string}; checked:boolean; onToggle:()=>void; outlineBtn?:boolean; brandColor:string; brandTextColor:string }) {
  return (
    <li style={{ display:'flex', alignItems:'center', gap:14, padding:'18px 24px', borderBottom:'1px solid #F0EBE1' }}>
      <div onClick={onToggle} style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, border:`2px solid ${checked ? brandColor : '#D1C9B8'}`, background: checked ? brandColor : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:brandTextColor, fontSize:13, fontWeight:700, transition:'all 0.2s', cursor:'pointer' }}>
        {checked ? '✓' : ''}
      </div>
      {emoji && <span style={{ fontSize:18, flexShrink:0 }}>{emoji}</span>}
      <div style={{ flex:1, minWidth:0, cursor:'pointer' }} onClick={onToggle}>
        <strong style={{ display:'block', fontWeight:600, color:brandColor, fontSize:15 }}>{label}</strong>
        {sub && <span style={{ fontSize:13, color:'#888', marginTop:2, display:'block' }}>{sub}</span>}
      </div>
      {link && (
        <a href={link.href} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
          style={outlineBtn
            ? { fontSize:13, fontWeight:600, color:brandColor, background:'transparent', border:`1px solid ${brandColor}33`, padding:'8px 18px', borderRadius:8, textDecoration:'none', whiteSpace:'nowrap', flexShrink:0 }
            : { fontSize:13, fontWeight:600, color:brandTextColor, background:brandColor, padding:'8px 18px', borderRadius:8, textDecoration:'none', whiteSpace:'nowrap', flexShrink:0 }
          }>
          {link.text}
        </a>
      )}
    </li>
  )
}

export default function HubClient({ org }: { org: Org }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const hubLayout = useMemo(() => parseHubLayout(org.hubSectionsJson), [org.hubSectionsJson])
  const hubContent = useMemo(() => parseHubContent(org.hubContentJson), [org.hubContentJson])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(user => {
        if (user && (user.role === 'SUPER_ADMIN' || (user.role === 'ORG_ADMIN' && user.orgSlug === org.slug))) {
          setIsAdmin(true)
        }
      })
      .catch(() => {})
  }, [org.slug])

  const primary = org.primaryColor || '#3E4A27'
  const accent  = org.accentColor  || '#C45A1A'
  const onPrimary = contrastText(primary)
  const onAccent  = contrastText(accent)
  const fbUrl    = org.facebookUrl

  const onboardResolved = useMemo(() => resolveOnboardingItems(hubContent.onboarding, fbUrl), [hubContent, fbUrl])
  const onboardTotal = onboardResolved.length
  const essentialsTotal = hubContent.essentials.length

  const onboard    = useServerChecklist({ orgId: org.id, listKey: 'onboard',    total: onboardTotal })
  const essentials = useServerChecklist({ orgId: org.id, listKey: 'essentials', total: essentialsTotal })

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#F5F1EA', minHeight:'100vh', color:'#2C2416' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700&family=DM+Sans:wght@300..600&display=swap');
        *{box-sizing:border-box} a{transition:opacity 0.15s} a:hover{opacity:0.85}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        main>*{animation:fadeUp 0.4s ease both}
      `}} />

      {/* ADMIN BAR */}
      {isAdmin && (
        <div style={{ background:primary, padding:'10px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:`${onPrimary}88` }}>Admin Preview</span>
          <a href={`/admin/${org.slug}`}
            style={{ fontSize:12, fontWeight:600, color:onAccent, background:accent, padding:'6px 18px', borderRadius:8, textDecoration:'none' }}>
            ← Back to Admin Panel
          </a>
        </div>
      )}

      {/* NAV — top, dark, pill buttons */}
      <nav style={{ background:primary, display:'flex', justifyContent:'center', gap:8, padding:'14px 20px', flexWrap:'wrap' }}>
        {hubLayout.nav.map(item => (
          <a key={item.href + item.label} href={item.href} target={item.href.startsWith('#') ? undefined : '_blank'} rel={item.href.startsWith('#') ? undefined : 'noreferrer'} style={{ padding:'8px 20px', fontSize:13, fontWeight:500, textDecoration:'none', color:onPrimary, borderRadius:8, border:`1px solid ${onPrimary}40`, background:'transparent', whiteSpace:'nowrap' }}>{item.label}</a>
        ))}
      </nav>

      {/* HERO */}
      <header style={{ background:`linear-gradient(180deg, ${primary} 0%, ${primary}dd 100%)`, padding:'48px 24px 0', textAlign:'center', position:'relative' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:accent }} />
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:accent }}>My Metabolic Reboot</span>
        </div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(42px,10vw,72px)', fontWeight:700, fontStyle:'italic', color:onPrimary, margin:'0 0 16px', lineHeight:1.05 }}>{org.name}</h1>
        <p style={{ color:`${onPrimary}aa`, fontSize:15, maxWidth:560, margin:'0 auto 36px', lineHeight:1.7 }}>
          {org.welcomeMessage || "Watch the start video, grab the Zoom links, get your essentials, and use the Daily videos to stay consistent. Keep it simple. Don\u2019t overthink it. Just execute."}
        </p>

        {/* Quick Start — inside hero */}
        <a href={hubContent.quickStart.url} target="_blank" rel="noreferrer"
          style={{ background:'#fff', borderRadius:16, padding:'20px 24px', display:'flex', alignItems:'center', gap:20, textDecoration:'none', maxWidth:560, margin:'0 auto', position:'relative', boxShadow:'0 8px 32px rgba(0,0,0,0.25)', transform:'translateY(28px)' }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:primary, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:onPrimary, flexShrink:0 }}>▶</div>
          <div style={{ flex:1, textAlign:'left' }}>
            <div style={{ fontSize:11, fontWeight:500, color:'#888', marginBottom:3 }}>{hubContent.quickStart.tagline}</div>
            <div style={{ fontWeight:700, fontSize:16, color:primary }}>{hubContent.quickStart.title}</div>
          </div>
          <div style={{ fontSize:20, color:primary, flexShrink:0 }}>→</div>
        </a>
      </header>

      <main style={{ maxWidth:780, margin:'0 auto', padding:'56px 20px 80px' }}>

        <SectionDivider label={hubLayout.onboarding.sectionTitle} />

        {/* Onboarding */}
        <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:16 }}>
          <div style={{ padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #F0EBE1' }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:22, color:primary, margin:0, fontStyle:'italic' }}>{hubLayout.onboarding.innerTitle || 'Before You Start'}</h2>
            {!onboard.loading && onboardTotal > 0 && <span style={{ fontSize:14, color:'#888' }}><strong style={{ color:primary }}>{onboard.doneCount}</strong> / {onboardTotal} done</span>}
          </div>
          {!onboard.loading && <>
            {onboard.allDone && <CompletionBanner label={hubContent.completionMessages.onboardComplete} onReset={onboard.reset} color={primary} textColor={onPrimary} />}
            <ul style={{ listStyle:'none', padding:0, margin:0 }}>
              {onboardResolved.map((item,i)=>(
                <CheckItem key={i} label={item.label} sub={item.sub} link={item.link} checked={onboard.checked[i]} onToggle={()=>onboard.toggle(i)} brandColor={primary} brandTextColor={onPrimary} />
              ))}
            </ul>
          </>}
        </div>
        <SectionActionButtons buttons={hubLayout.onboarding.buttons} primary={primary} onPrimary={onPrimary} />

        {/* Essentials */}
        <SectionDivider label={hubLayout.essentials.sectionTitle} />
        <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:16 }}>
          <div style={{ padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #F0EBE1' }}>
            <h2 style={{ fontWeight:700, fontSize:18, color:primary, margin:0 }}>{hubLayout.essentials.innerTitle || 'Checklist'}</h2>
            {!essentials.loading && essentialsTotal > 0 && <span style={{ fontSize:14, color:'#888' }}><strong style={{ color:primary }}>{essentials.doneCount}</strong> / {essentialsTotal} done</span>}
          </div>
          {!essentials.loading && <>
            {essentials.allDone && <CompletionBanner label={hubContent.completionMessages.essentialsComplete} onReset={essentials.reset} color={primary} textColor={onPrimary} />}
            <ul style={{ listStyle:'none', padding:0, margin:0 }}>
              {hubContent.essentials.map((item,i)=>(
                <CheckItem key={i} emoji={item.emoji} label={item.label} sub={item.sub} link={item.linkUrl && item.linkText ? { href: item.linkUrl, text: item.linkText } : undefined} checked={essentials.checked[i]} onToggle={()=>essentials.toggle(i)} outlineBtn={item.outlineButton} brandColor={primary} brandTextColor={onPrimary} />
              ))}
            </ul>
          </>}
        </div>
        <SectionActionButtons buttons={hubLayout.essentials.buttons} primary={primary} onPrimary={onPrimary} />

        {(org.zoomCalls.length > 0 || org.zoomRecordingsUrl || hubLayout.communityZoom.buttons.length > 0) && (<>
        <SectionDivider label={hubLayout.communityZoom.sectionTitle} />
        {org.zoomCalls.map(zc => (
          <div key={zc.id} style={{ background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:16 }}>
            <div style={{ padding:'28px 28px 24px' }}>
              <div style={{ fontWeight:700, fontSize:20, color:primary, marginBottom:6 }}>{zc.title}</div>
              {zc.schedule && <div style={{ fontSize:15, color:primary, marginBottom:2 }}>{zc.schedule}</div>}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
                {zc.meetingId && <span style={{ display:'inline-block', fontSize:12, color:primary, background:'#F5F1EA', padding:'5px 12px', borderRadius:6, fontWeight:500 }}>ID: {zc.meetingId}</span>}
                {zc.passcode && <span style={{ display:'inline-block', fontSize:12, color:primary, background:'#F5F1EA', padding:'5px 12px', borderRadius:6, fontWeight:500 }}>Passcode: {zc.passcode}</span>}
              </div>
            </div>
            <div style={{ padding:'0 28px 28px' }}>
              <a href={zc.zoomLink} target="_blank" rel="noreferrer" style={{ background:primary, color:onPrimary, fontSize:15, fontWeight:600, padding:'14px 0', borderRadius:8, textDecoration:'none', textAlign:'center', display:'block' }}>Join Zoom</a>
            </div>
          </div>
        ))}
        {org.zoomRecordingsUrl && (
          <a href={org.zoomRecordingsUrl} target="_blank" rel="noreferrer" style={{ background:'transparent', color:primary, border:`1px solid ${primary}33`, fontSize:15, fontWeight:600, padding:'14px 0', borderRadius:8, textDecoration:'none', textAlign:'center', display:'block', marginBottom:16 }}>Past Recordings</a>
        )}
        <SectionActionButtons buttons={hubLayout.communityZoom.buttons} primary={primary} onPrimary={onPrimary} />
        </>)}

        <SectionDivider label={hubLayout.guides.sectionTitle} id="mm-guides" />
        <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:16 }}>
          {hubContent.guides.map((g,i)=>(
            <a key={g.url + i} href={g.url} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 24px', textDecoration:'none', borderBottom: i < hubContent.guides.length-1 ? '1px solid #F0EBE1' : 'none' }}>
              <span style={{ width:44, height:44, borderRadius:12, background:'#F5F1EA', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{g.emoji}</span>
              <span style={{ flex:1, fontWeight:600, fontSize:15, color:primary }}>{g.name}</span>
              <span style={{ fontSize:16, color:'#888', flexShrink:0 }}>→</span>
            </a>
          ))}
        </div>
        <SectionActionButtons buttons={hubLayout.guides.buttons} primary={primary} onPrimary={onPrimary} />

        <SectionDivider label={hubLayout.tips.sectionTitle} id="mm-tips" />
        <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:16 }}>
          {hubContent.tips.map((t,i)=>(
            <a key={t.url + i} href={t.url} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:16, padding:'20px 24px', textDecoration:'none', borderBottom: i < hubContent.tips.length-1 ? '1px solid #F0EBE1' : 'none' }}>
              <span style={{ width:44, height:44, borderRadius:12, background:'#F5F1EA', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{t.emoji}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:15, color:primary, marginBottom:2 }}>{t.title}</div>
                <div style={{ fontSize:13, color:'#888', lineHeight:1.4 }}>{t.desc}</div>
              </div>
              <span style={{ fontSize:16, color:'#888', flexShrink:0 }}>→</span>
            </a>
          ))}
        </div>
        <SectionActionButtons buttons={hubLayout.tips.buttons} primary={primary} onPrimary={onPrimary} />

        <SectionDivider label={hubLayout.dailyVideos.sectionTitle} id="mm-daily" />
        <a href={hubContent.nightBefore.url} target="_blank" rel="noreferrer"
          style={{ background:primary, borderRadius:16, padding:'22px 24px', display:'flex', alignItems:'center', gap:18, textDecoration:'none', marginBottom:12 }}>
          <span style={{ width:52, height:52, borderRadius:'50%', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{hubContent.nightBefore.emoji}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:accent, marginBottom:4 }}>{hubContent.nightBefore.tagline}</div>
            <div style={{ fontWeight:700, fontSize:17, color:onPrimary, marginBottom:4 }}>{hubContent.nightBefore.title}</div>
            <div style={{ fontSize:13, color:`${onPrimary}88` }}>{hubContent.nightBefore.sub}</div>
          </div>
          <span style={{ fontSize:18, color:onPrimary, flexShrink:0 }}>→</span>
        </a>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
          {hubContent.dailyVideoDays.map(v=>(
            <a key={v.url} href={v.url} target="_blank" rel="noreferrer" style={{ background:'#fff', border:'1px solid #E8E2D6', borderRadius:14, padding:'16px 14px', textDecoration:'none' }}>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'#888', marginBottom:6 }}>{v.day}</div>
              <div style={{ fontWeight:700, fontSize:14, color:primary }}>{v.label}</div>
            </a>
          ))}
        </div>
        <SectionActionButtons buttons={hubLayout.dailyVideos.buttons} primary={primary} onPrimary={onPrimary} />

        {hubLayout.watchThis.sectionTitle.trim() ? <SectionDivider label={hubLayout.watchThis.sectionTitle} /> : null}
        {/* Featured video card */}
        <a href={hubLayout.watchThis.cardUrl || 'https://youtube.com/shorts/1P-KCIrQoEQ'} target="_blank" rel="noreferrer"
          style={{ background:'#FDF6E3', border:'1px solid #EDE0C0', borderRadius:16, padding:'22px 24px', display:'flex', alignItems:'center', gap:18, textDecoration:'none', marginBottom:16 }}>
          <span style={{ width:52, height:52, borderRadius:'50%', background:'#F5EDD6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>💡</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:accent, marginBottom:4 }}>{hubLayout.watchThis.cardTagline || 'Watch This'}</div>
            <div style={{ fontWeight:600, fontSize:16, color:primary }}>{hubLayout.watchThis.cardTitle}</div>
          </div>
          <span style={{ fontSize:18, color:accent, flexShrink:0 }}>→</span>
        </a>
        <SectionActionButtons buttons={hubLayout.watchThis.buttons} primary={primary} onPrimary={onPrimary} />

        <SectionDivider label={hubLayout.accountOrders.sectionTitle} />
        <a href="https://www.optavia.com/us/en/" target="_blank" rel="noreferrer"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', background:primary, padding:'14px 0', borderRadius:8, textDecoration:'none', marginBottom:16 }}>
          <img src="https://tiggbprqgezztvcakpce.supabase.co/storage/v1/object/public/branding/optavia_logo.png" alt="OPTAVIA — Reorder" style={{ height:32, objectFit:'contain' }} />
        </a>
        <SectionActionButtons buttons={hubLayout.accountOrders.buttons} primary={primary} onPrimary={onPrimary} />
        <Card icon={hubContent.orderEdit.icon} title={hubContent.orderEdit.title} sub={hubContent.orderEdit.sub} brandColor={primary}>
          <div style={{ background:'#F5F1EA', borderRadius:12, padding:'14px 18px', fontSize:13, color:'#666', borderLeft:`3px solid ${primary}`, margin:'12px 0' }}>
            {hubContent.orderEdit.calloutLead}&nbsp;
            <a href={hubContent.orderEdit.videoUrl} target="_blank" rel="noreferrer" style={{ color:primary, fontWeight:600 }}>{hubContent.orderEdit.videoLinkText}</a>
          </div>
          <ol style={{ listStyle:'none', padding:0, margin:0 }}>
            {hubContent.orderEdit.steps.map((s,i)=>(
              <li key={i} style={{ display:'flex', gap:14, padding:'12px 0', borderBottom:i<hubContent.orderEdit.steps.length-1?'1px solid #F0EBE1':'none', fontSize:14 }}>
                <span style={{ width:26, height:26, background:primary, color:onPrimary, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{i+1}</span>
                <div><strong style={{ display:'block', color:primary }}>{s.title}</strong><span style={{ color:'#888', fontSize:13 }}>{s.body}</span></div>
              </li>
            ))}
          </ol>
        </Card>

        <Card icon={hubContent.referral.icon} title={hubContent.referral.title} sub={hubContent.referral.sub} id="mm-referral" brandColor={primary}>
          <ol style={{ listStyle:'none', padding:0, margin:0 }}>
            {hubContent.referral.steps.map((s,i)=>(
              <li key={i} style={{ display:'flex', gap:14, padding:'12px 0', borderBottom:i<hubContent.referral.steps.length-1?'1px solid #F0EBE1':'none', fontSize:14 }}>
                <span style={{ width:26, height:26, background:primary, color:onPrimary, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{i+1}</span>
                <span style={{ color:primary }}>{s}</span>
              </li>
            ))}
          </ol>
          <div style={{ marginTop:16 }}>
            {hubContent.referral.warnings.map(w=>(
              <div key={w} style={{ display:'flex', gap:8, fontSize:13, color:'#888', padding:'4px 0' }}><span style={{ color:'#C43B3B', fontWeight:700 }}>✕</span>{w}</div>
            ))}
            <div style={{ display:'flex', gap:8, fontSize:13, color:'#888', padding:'4px 0' }}><span style={{ color:'#5C6B3A', fontWeight:700 }}>✓</span>{hubContent.referral.successNote}</div>
          </div>
        </Card>
      </main>

      <footer style={{ textAlign:'center', padding:'48px 20px 40px' }}>
        <p style={{ fontSize:15, color:primary, margin:'0 0 24px' }}>
          <strong>Stay close to your coach.</strong>{' '}
          <span style={{ color:'#888' }}>They&apos;ve got your back.</span>
        </p>
        <div style={{ fontSize:11, color:'#aaa', marginBottom:6 }}>© {org.name} · My Metabolic Reboot</div>
        <a href="/terms" target="_blank" rel="noreferrer" style={{ color:'#aaa', textDecoration:'none', fontSize:11 }}>Terms of Service &amp; Disclosures</a>
      </footer>
    </div>
  )
}
