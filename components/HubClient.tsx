'use client'

import { useState, useEffect } from 'react'
import { useServerChecklist } from '@/lib/useServerChecklist'

export type Org = {
  id: string; slug: string; name: string; logoUrl: string | null
  primaryColor: string; accentColor: string; welcomeMessage: string | null
  zoomLink: string | null; zoomSchedule: string | null
  zoomMeetingId: string | null; zoomRecordingsUrl: string | null; facebookUrl: string | null
}

const DAILY_VIDEOS = [
  { day: 'Night Before', label: 'Prep your environment. Set expectations. Start clean.', url: 'https://hohdigitallibrary.com/nightbefore', isNight: true },
  { day: 'Day 1', label: 'Kickoff',          url: 'https://hohdigitallibrary.com/day1' },
  { day: 'Day 2', label: 'Build Momentum',   url: 'https://hohdigitallibrary.com/day2' },
  { day: 'Day 3', label: 'Dial In Basics',   url: 'https://hohdigitallibrary.com/day3' },
  { day: 'Day 4', label: 'Stay Consistent',  url: 'https://hohdigitallibrary.com/day4' },
  { day: 'Day 5', label: 'Win the Weekend',  url: 'https://hohdigitallibrary.com/day5' },
  { day: 'Day 6', label: "Don't Overthink",  url: 'https://hohdigitallibrary.com/day6' },
  { day: 'Day 7', label: 'Finish Week One',  url: 'https://hohdigitallibrary.com/day7' },
  { day: 'Day 8', label: 'Lock It In',       url: 'https://hohdigitallibrary.com/day8' },
]
const GUIDES = [
  { emoji: '📘', name: 'Optavia Guide',              url: 'https://optaviamedia.com/pdf/LEARN/32240-GUI_OPTAVIA-Guide.pdf' },
  { emoji: '🥦', name: 'Vegetable Conversion Chart', url: 'https://optaviamedia.com/pdf/LEARN/OPTAVIA-Vegetarian_Conversion_Chart.pdf' },
  { emoji: '🧴', name: 'Condiments + Healthy Fats',  url: 'https://optaviamedia.com/pdf/LEARN/OPTAVIA_CondimentSheet.pdf' },
  { emoji: '🌿', name: 'Vegetarian Info Sheet',      url: 'https://optaviamedia.com/pdf/learn/OPTAVIA-Vegetarian-Info-Sheet.pdf' },
  { emoji: '🍽️', name: 'Dining Out Guide',           url: 'https://optaviamedia.com/pdf/learn/50054-GUI_OPTAVIA-Dining-Out.pdf' },
]
const TIPS = [
  { emoji: '🔬', title: 'The Reset Explained',          desc: "Understand how the metabolic reset works and why it's effective", url: 'https://www.themetabolicmission.com/resetexplained' },
  { emoji: '🍷', title: 'Alcohol & the Reset',          desc: 'What you need to know about alcohol during your program',        url: 'https://www.themetabolicmission.com/alcohol' },
  { emoji: '🏃', title: 'Working Out During the Reset', desc: 'How to exercise safely and effectively while on the program',    url: 'https://www.themetabolicmission.com/workingout' },
]

function SectionDivider({ label, id }: { label: string; id?: string }) {
  return (
    <div id={id} style={{ display:'flex', alignItems:'center', gap:10, margin:'48px 0 20px' }}>
      <div style={{ flex:1, height:1, background:'#E2D9C5' }} />
      <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7A6E5C' }}>{label}</span>
      <div style={{ flex:1, height:1, background:'#E2D9C5' }} />
    </div>
  )
}

function ProgressBar({ pct, accent }: { pct: number; accent: string }) {
  return (
    <div style={{ height:5, background:'#E2D9C5', borderRadius:3, margin:'12px 0 16px', overflow:'hidden' }}>
      <div style={{ height:'100%', borderRadius:3, background: pct===100 ? '#5C6B3A' : accent, width:`${pct}%`, transition:'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  )
}

function CompletionBanner({ label, onReset }: { label: string; onReset: () => void }) {
  return (
    <div style={{ background:'linear-gradient(120deg,#3E4A27,#5C6B3A)', borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', margin:'4px 0 8px', gap:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:20 }}>🎉</span>
        <span style={{ color:'#FDFAF4', fontWeight:600, fontSize:14 }}>{label}</span>
      </div>
      <button onClick={onReset} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.5)', color:'#FFFFFF', fontSize:11, fontWeight:600, padding:'5px 12px', borderRadius:6, cursor:'pointer' }}>Reset</button>
    </div>
  )
}

function Card({ icon, title, sub, children, defaultOpen=false }: { icon:string; title:string; sub?:React.ReactNode; children:React.ReactNode; defaultOpen?:boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ background:'#FDFAF4', borderRadius:14, border:'1px solid #E2D9C5', overflow:'hidden', marginBottom:12, boxShadow:'0 2px 12px rgba(44,36,22,0.07)' }}>
      <div onClick={() => setOpen(o=>!o)} style={{ padding:'18px 22px', display:'flex', alignItems:'center', gap:14, cursor:'pointer', userSelect:'none' }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:600, fontSize:15, color:'#2C2416' }}>{title}</div>
          {sub && <div style={{ fontSize:12, color:'#7A6E5C', marginTop:1 }}>{sub}</div>}
        </div>
        <span style={{ fontSize:13, color:'#7A6E5C', display:'inline-block', transition:'transform 0.25s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </div>
      {open && <div style={{ padding:'4px 22px 20px', borderTop:'1px solid #EDE4D0' }}>{children}</div>}
    </div>
  )
}

function CheckItem({ label, sub, link, checked, onToggle, accent }: { label:string; sub?:string; link?:{href:string;text:string}; checked:boolean; onToggle:()=>void; accent:string }) {
  return (
    <li onClick={onToggle} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'11px 0', borderBottom:'1px solid #F7F2E8', cursor:'pointer', opacity: checked ? 0.5 : 1, transition:'opacity 0.2s' }}>
      <div style={{ width:22, height:22, borderRadius:6, flexShrink:0, marginTop:1, border:`2px solid ${checked ? accent : '#E2D9C5'}`, background: checked ? accent : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:12, fontWeight:700, transition:'all 0.2s' }}>
        {checked ? '✓' : ''}
      </div>
      <div style={{ flex:1 }}>
        <strong style={{ display:'block', fontWeight:500, color:'#2C2416', fontSize:14 }}>{label}</strong>
        {sub && <span style={{ fontSize:12, color:'#7A6E5C' }}>{sub}</span>}
      </div>
      {link && (
        <a href={link.href} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
          style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:accent, padding:'4px 10px', border:`1px solid ${accent}`, borderRadius:20, textDecoration:'none', whiteSpace:'nowrap', flexShrink:0 }}>
          {link.text}
        </a>
      )}
    </li>
  )
}

export default function HubClient({ org }: { org: Org }) {
  const [isAdmin, setIsAdmin] = useState(false)

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
  const zoomLink = org.zoomLink    || 'https://zoom.us/j/8156301595'
  const zoomTime = org.zoomSchedule  || '7pm CST · 8pm EST'
  const zoomId   = org.zoomMeetingId || '815 630 1595'
  const fbUrl    = org.facebookUrl || 'https://www.facebook.com/groups/4049870241960036'

  const onboard    = useServerChecklist({ orgId: org.id, listKey: 'onboard',    total: 6 })
  const essentials = useServerChecklist({ orgId: org.id, listKey: 'essentials', total: 3 })

  const totalDone  = onboard.doneCount + essentials.doneCount
  const overallPct = Math.round((totalDone / 9) * 100)

  const onboardItems = [
    { label: 'Watch Element 1 video',           sub: '"Being Clear Why You\'re Here"',               link: { href:'https://vimeo.com/670494023/69cfa64553', text:'Watch →' } },
    { label: 'Write your WHYs',                 sub: 'Take a photo holding it and send to your coach' },
    { label: 'Take before photos',              sub: 'Front, back, and side — you\'ll want these later' },
    { label: 'Download the Optavia app',        sub: 'Recipes, reminders, and tracking',             link: { href:'https://apps.apple.com/us/app/optavia/id1477201061', text:'Get App' } },
    { label: 'Join the private Facebook group', sub: 'Introduce yourself so we can support you',     link: { href:fbUrl, text:'Join →' } },
    { label: 'Attend the Sunday Kick Off Zoom', sub: `3pm PST · 5pm CST · 6pm EST · ID: ${zoomId}`, link: { href:zoomLink, text:'Join →' } },
  ]
  const essItems = [
    { label: '🥩 Food Scale',             sub: 'To weigh lean protein — essential' },
    { label: '⚖️ Body Composition Scale', sub: 'Digital is best — RENPHO recommended', link: { href:'https://www.amazon.com/RENPHO-Bluetooth-Bathroom-Composition-Smartphone/dp/B01N1UX8RW', text:'Amazon →' } },
    { label: '📏 Measuring Tape',         sub: "Track inches lost — the scale doesn't show everything" },
  ]

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#F7F2E8', minHeight:'100vh', color:'#2C2416' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box} a{transition:opacity 0.15s} a:hover{opacity:0.85}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        main>*{animation:fadeUp 0.4s ease both}
      `}} />

      {/* ADMIN BAR */}
      {isAdmin && (
        <div style={{ background:'#2C2416', padding:'10px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)' }}>Admin Preview</span>
          <a href={`/admin/${org.slug}`}
            style={{ fontSize:12, fontWeight:600, color:'#fff', background:accent, padding:'6px 18px', borderRadius:6, textDecoration:'none' }}>
            ← Back to Admin Panel
          </a>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background:primary, padding:'28px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', bottom:-1, left:0, right:0, height:24, background:'#F7F2E8', clipPath:'ellipse(55% 100% at 50% 100%)' }} />
        {org.logoUrl && <img src={org.logoUrl} alt={org.name} style={{ height:56, marginBottom:14, objectFit:'contain', borderRadius:8 }} />}
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(28px,6vw,46px)', fontWeight:600, color:'#FDFAF4', margin:0, lineHeight:1.1 }}>{org.name}</h1>
        {!onboard.loading && (
          <div style={{ marginTop:14, display:'inline-flex', alignItems:'center', gap:10, background:'rgba(0,0,0,0.25)', borderRadius:30, padding:'6px 16px' }}>
            <div style={{ width:100, height:4, background:'rgba(255,255,255,0.2)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${overallPct}%`, background: overallPct===100 ? '#8A9D5C' : accent, borderRadius:2, transition:'width 0.5s' }} />
            </div>
            <span style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.7)', letterSpacing:'0.1em' }}>
              {overallPct===100 ? '✓ All set!' : `${overallPct}% set up`}
            </span>
          </div>
        )}
      </header>

      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:primary, borderBottom:`2px solid ${accent}`, display:'flex', justifyContent:'center', boxShadow:'0 2px 16px rgba(44,36,22,0.18)', flexWrap:'wrap' }}>
        {[['#mm-daily','📹 Daily'],['#mm-guides','📘 Guides'],['#mm-tips','💡 Tips'],['#mm-referral','🎁 Referral']].map(([href,label])=>(
          <a key={href} href={href} style={{ padding:'13px 18px', fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', textDecoration:'none', color:'#FFFFFF', whiteSpace:'nowrap' }}>{label}</a>
        ))}
      </nav>

      <main style={{ maxWidth:780, margin:'0 auto', padding:'36px 20px 80px' }}>
        <p style={{ textAlign:'center', color:'#7A6E5C', fontSize:14, margin:'8px 0 28px', fontStyle:'italic', lineHeight:1.7 }}>
          {org.welcomeMessage || "Watch the start video, grab the Zoom links, get your essentials, and use the Daily videos to stay consistent. Keep it simple. Don't overthink it. Just execute."}
        </p>

        {/* Quick Start */}
        <a href="https://vimeo.com/835524024?share=copy" target="_blank" rel="noreferrer"
          style={{ background:primary, borderRadius:16, padding:'28px 32px', display:'flex', alignItems:'center', gap:24, marginBottom:8, textDecoration:'none', boxShadow:'0 4px 24px rgba(44,36,22,0.18)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(120deg,rgba(196,90,26,0.15),transparent 60%)' }} />
          <div style={{ width:56, height:56, borderRadius:'50%', background:accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'white', flexShrink:0, zIndex:1 }}>▶</div>
          <div style={{ flex:1, zIndex:1 }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.7)', marginBottom:4 }}>Start Here · 7 min</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:600, color:'#FDFAF4', marginBottom:2 }}>Watch the Quick Start Video</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.75)' }}>Everything you need to know before day one</div>
          </div>
          <div style={{ fontSize:22, color:'#FFFFFF', zIndex:1 }}>→</div>
        </a>

        <SectionDivider label="Before You Start" />

        {/* Onboarding */}
        <Card icon="✅" title="Onboarding Checklist" defaultOpen
          sub={onboard.loading ? 'Loading your progress…' : onboard.allDone ? '🎉 All done!' : `${onboard.doneCount} of 6 steps complete`}>
          {!onboard.loading && <>
            <ProgressBar pct={Math.round(onboard.doneCount/6*100)} accent={accent} />
            {onboard.allDone && <CompletionBanner label="Onboarding complete! You're ready to go." onReset={onboard.reset} />}
            <ul style={{ listStyle:'none', padding:0, margin:0 }}>
              {onboardItems.map((item,i)=>(
                <CheckItem key={i} label={item.label} sub={item.sub} link={item.link} checked={onboard.checked[i]} onToggle={()=>onboard.toggle(i)} accent={accent} />
              ))}
            </ul>
          </>}
        </Card>

        {/* Essentials */}
        <Card icon="🛒" title="Program Essentials"
          sub={essentials.loading ? 'Loading…' : essentials.allDone ? '✓ All items ready' : `${essentials.doneCount} of 3 items ready`}>
          {!essentials.loading && <>
            <ProgressBar pct={Math.round(essentials.doneCount/3*100)} accent={accent} />
            {essentials.allDone && <CompletionBanner label="You've got everything you need!" onReset={essentials.reset} />}
            <ul style={{ listStyle:'none', padding:0, margin:0 }}>
              {essItems.map((item,i)=>(
                <CheckItem key={i} label={item.label} sub={item.sub} link={item.link} checked={essentials.checked[i]} onToggle={()=>essentials.toggle(i)} accent={accent} />
              ))}
            </ul>
          </>}
        </Card>

        <SectionDivider label="Community" />
        <div style={{ background:primary, borderRadius:14, padding:'24px 28px', display:'flex', alignItems:'center', gap:24, marginBottom:12, flexWrap:'wrap', boxShadow:'0 4px 20px rgba(44,36,22,0.15)' }}>
          <span style={{ background:accent, color:'white', fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', padding:'5px 12px', borderRadius:20, flexShrink:0 }}>Weekly</span>
          <div style={{ flex:1, minWidth:160 }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600, color:'#FFFFFF' }}>Client Community Zoom</div>
            <div style={{ fontSize:15, fontWeight:600, color:'rgba(255,255,255,0.85)', marginTop:6 }}>{zoomTime} · ID: {zoomId}</div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <a href={zoomLink} target="_blank" rel="noreferrer" style={{ background:accent, color:'white', fontSize:12, fontWeight:600, padding:'10px 20px', borderRadius:8, textDecoration:'none' }}>Join Zoom</a>
            {(org.zoomRecordingsUrl) && (
              <a href={org.zoomRecordingsUrl} target="_blank" rel="noreferrer" style={{ background:'transparent', color:'#FDFAF4', border:'1px solid rgba(255,255,255,0.25)', fontSize:12, fontWeight:600, padding:'10px 20px', borderRadius:8, textDecoration:'none' }}>Past Recordings</a>
            )}
          </div>
        </div>

        <SectionDivider label="Reference Guides" id="mm-guides" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10, marginBottom:12 }}>
          {GUIDES.map(g=>(
            <a key={g.url} href={g.url} target="_blank" rel="noreferrer" style={{ background:'#FDFAF4', border:'1px solid #E2D9C5', borderRadius:12, padding:'18px 20px', textDecoration:'none', display:'flex', alignItems:'center', gap:14 }}>
              <span style={{ fontSize:22 }}>{g.emoji}</span>
              <div><div style={{ fontWeight:600, fontSize:13, color:'#2C2416' }}>{g.name}</div><div style={{ fontSize:11, color:accent, fontWeight:600, marginTop:2 }}>Open PDF →</div></div>
            </a>
          ))}
        </div>

        <SectionDivider label="Metabolic Reset Tips" id="mm-tips" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10, marginBottom:12 }}>
          {TIPS.map(t=>(
            <a key={t.url} href={t.url} target="_blank" rel="noreferrer" style={{ background:'#FDFAF4', border:'1px solid #E2D9C5', borderLeft:`4px solid ${accent}`, borderRadius:12, padding:'20px 18px', textDecoration:'none' }}>
              <div style={{ fontSize:24, marginBottom:10 }}>{t.emoji}</div>
              <div style={{ fontWeight:600, fontSize:14, color:'#2C2416', marginBottom:4 }}>{t.title}</div>
              <div style={{ fontSize:12, color:'#7A6E5C', lineHeight:1.5 }}>{t.desc}</div>
              <div style={{ fontSize:11, color:accent, fontWeight:600, marginTop:10 }}>Read More →</div>
            </a>
          ))}
        </div>

        <SectionDivider label="Daily Videos" id="mm-daily" />
        <a href="https://hohdigitallibrary.com/nightbefore" target="_blank" rel="noreferrer"
          style={{ background:'#2C2416', borderRadius:14, padding:'22px 24px', display:'flex', alignItems:'center', gap:20, textDecoration:'none', marginBottom:12 }}>
          <span style={{ fontSize:32 }}>🌙</span>
          <div>
            <div style={{ fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'#A89E8C', marginBottom:4 }}>Start Here</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600, color:'#FDFAF4', marginBottom:4 }}>Night Before You Begin</div>
            <div style={{ fontSize:12, color:'#A89E8C' }}>Prep your environment. Set expectations. Start clean.</div>
          </div>
          <span style={{ marginLeft:'auto', fontSize:18, color:accent }}>→</span>
        </a>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:8, marginBottom:12 }}>
          {DAILY_VIDEOS.filter(v=>!v.isNight).map(v=>(
            <a key={v.url} href={v.url} target="_blank" rel="noreferrer" style={{ background:'#FDFAF4', border:'1px solid #E2D9C5', borderRadius:12, padding:16, textDecoration:'none' }}>
              <span style={{ display:'inline-block', background:accent, color:'white', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:4, marginBottom:8 }}>{v.day}</span>
              <div style={{ fontWeight:600, fontSize:13, color:'#2C2416' }}>{v.label}</div>
            </a>
          ))}
        </div>

        <SectionDivider label="Account & Orders" />
        <Card icon="📦" title="How to Edit Your Order" sub="Update your Premier Order in a few steps">
          <div style={{ background:'#EDE4D0', borderRadius:10, padding:'14px 18px', fontSize:12, color:'#7A6E5C', borderLeft:`3px solid ${accent}`, margin:'12px 0' }}>
            📹 Watch the short video first —&nbsp;
            <a href="https://vimeo.com/user20141625/updateorder" target="_blank" rel="noreferrer" style={{ color:accent, fontWeight:600 }}>Watch Order Update Video →</a>
          </div>
          <ol style={{ listStyle:'none', padding:0, margin:0 }}>
            {[{t:'Log in at optavia.com',b:'Open your Account Dashboard. Temp password: Welcome1! (capital W + !)'},
              {t:'Update your fuelings',b:'Remove the kit and add at least 20 individual boxes. Stay in the Optavia Essential line.'},
              {t:'Optional add-ons',b:'Lifebook, Habits of Health, microwavable lean & green meals, hydration, snacks.'},
              {t:'Stack your savings',b:'10% off over $250 · 15% off over $350'},
            ].map((s,i)=>(
              <li key={i} style={{ display:'flex', gap:14, padding:'12px 0', borderBottom:i<3?'1px solid #EDE4D0':'none', fontSize:14 }}>
                <span style={{ width:26, height:26, background:accent, color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{i+1}</span>
                <div><strong style={{ display:'block', color:'#2C2416' }}>{s.t}</strong><span style={{ color:'#7A6E5C', fontSize:13 }}>{s.b}</span></div>
              </li>
            ))}
          </ol>
        </Card>

        <SectionDivider label="Referral Program" id="mm-referral" />
        <a href="https://youtube.com/shorts/1P-KCIrQoEQ" target="_blank" rel="noreferrer"
          style={{ background:`linear-gradient(135deg,${primary},#4A5530)`, borderRadius:14, padding:'22px 24px', display:'flex', alignItems:'center', gap:20, textDecoration:'none', marginBottom:12 }}>
          <span style={{ fontSize:28 }}>💡</span>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, color:'#FDFAF4', marginBottom:4 }}>Join the mission. Make an impact. Earn as you go.</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>Watch the overview video →</div>
          </div>
          <span style={{ marginLeft:'auto', fontSize:18, color:accent }}>→</span>
        </a>
        <Card icon="🎁" title="Client Referral Program" sub="Share the Plan. Earn Credit. Follow every step exactly.">
          <ol style={{ listStyle:'none', padding:0, margin:0 }}>
            {['Find your link in the Client App and share it','Your friend must click your link first — before anything else','They complete the referral form through your link','Same email on the form must be used for their account','Account created after the form is submitted','Friend places their qualifying order','Order must ship before credit activates','Referral credit confirmed after shipment'].map((s,i)=>(
              <li key={i} style={{ display:'flex', gap:14, padding:'12px 0', borderBottom:i<7?'1px solid #EDE4D0':'none', fontSize:14 }}>
                <span style={{ width:26, height:26, background:accent, color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{i+1}</span>
                <span style={{ color:'#2C2416' }}>{s}</span>
              </li>
            ))}
          </ol>
          <div style={{ marginTop:16 }}>
            {['No link click = no credit','No form submission = no credit','Email mismatch = no credit'].map(w=>(
              <div key={w} style={{ display:'flex', gap:8, fontSize:13, color:'#7A6E5C', padding:'4px 0' }}><span style={{ color:'#C43B3B', fontWeight:700 }}>✕</span>{w}</div>
            ))}
            <div style={{ display:'flex', gap:8, fontSize:13, color:'#7A6E5C', padding:'4px 0' }}><span style={{ color:'#5C6B3A', fontWeight:700 }}>✓</span>Credit applies after order ships, not when placed</div>
          </div>
          <p style={{ fontSize:13, color:'#7A6E5C', marginTop:12, fontWeight:600 }}>Stay close to your coach. They&apos;ve got your back.</p>
        </Card>
      </main>

      <footer style={{ textAlign:'center', padding:'32px 20px', fontSize:11, color:'#A89E8C', letterSpacing:'0.1em', borderTop:'1px solid #E2D9C5' }}>
        <div style={{ textTransform:'uppercase', marginBottom:8 }}>© {org.name} · The Daily Reset · All links open in a new tab</div>
        <a href="/terms" target="_blank" rel="noreferrer" style={{ color:'#A89E8C', textDecoration:'none', fontSize:10, letterSpacing:'0.05em' }}>Terms of Service &amp; Disclosures</a>
      </footer>
    </div>
  )
}
