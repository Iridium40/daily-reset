'use client'

import { useState } from 'react'

const PRIMARY = '#3E4A27'
const ACCENT = '#C45A1A'
const BG = '#F5F1EA'
const CARD_BORDER = '#F0EBE1'
const TEXT = '#2C2416'
const MUTED = '#7A6E5C'
const LIGHT_MUTED = '#A89E8C'

export default function OverviewPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: BG, minHeight: '100vh', color: TEXT }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700&family=DM+Sans:wght@300..600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { transition: opacity 0.15s; } a:hover { opacity: 0.85; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
      ` }} />

      <Hero />
      <ComparisonSection />
      <ClinicalData />
      <WhatMakesThisDifferent />
      <FourComponents />
      <HowItWorks />
      <FoodCategories />
      <Testimonials />
      <ThreePhases />
      <FAQ />
      <BottomCTA />
      <Footer />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  HERO                                                                      */
/* ════════════════════════════════════════════════════════════════════════════ */

function Hero() {
  return (
    <header style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${PRIMARY}dd 100%)`, padding: '80px 24px 64px', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT }} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: ACCENT }}>The New Science of Metabolic Health</span>
      </div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(38px, 8vw, 64px)', fontWeight: 700, fontStyle: 'italic', color: '#fff', lineHeight: 1.08, margin: '0 auto 20px', maxWidth: 700 }}>
        Reset Your Metabolism.<br />Restore Your Health.
      </h1>
      <p style={{ color: '#ffffffaa', fontSize: 16, maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}>
        A science-backed system designed to help you lose fat, preserve muscle, and transform your health from the inside out.
      </p>
      <a href="#components" style={{ display: 'inline-block', background: ACCENT, color: '#fff', fontSize: 14, fontWeight: 600, padding: '14px 32px', borderRadius: 10, textDecoration: 'none' }}>
        See the Plan Structure
      </a>
    </header>
  )
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  COMPARISON: Diet Trap vs Metabolic Reset                                  */
/* ════════════════════════════════════════════════════════════════════════════ */

function ComparisonSection() {
  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
      <SectionLabel>The Shift That Changes Everything</SectionLabel>
      <h2 style={h2Style}>Why typical dieting feels like a fight you can&apos;t win.</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 32 }}>
        <div style={{ ...cardStyle, borderTop: `3px solid #C43B3B` }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#C43B3B', marginBottom: 16 }}>The Traditional Diet Trap</h3>
          {[
            ['Sacrifices Muscle Tissue', 'Standard dieting often burns muscle for energy, effectively killing your metabolic engine.'],
            ['Drives Chronic Hunger', 'Blood sugar spikes and crashes lead to cravings that willpower alone can\u2019t beat.'],
            ['Triggers Metabolic Adaptation', 'Your body fights back by slowing down, making weight regain almost 100% certain.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <span style={{ color: '#C43B3B', fontWeight: 700, fontSize: 16, flexShrink: 0, marginTop: 1 }}>✕</span>
              <div><strong style={{ display: 'block', fontSize: 14, color: TEXT, marginBottom: 2 }}>{title}</strong><span style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{desc}</span></div>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle, borderTop: `3px solid ${PRIMARY}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: PRIMARY, marginBottom: 16 }}>The Metabolic Reset</h3>
          {[
            ['Protects Lean Muscle', 'Preserves metabolic tissue while specifically targeting stored fat for fuel.'],
            ['Stabilizes Blood Sugar', 'Eating frequently eliminates hunger and keeps your energy levels high all day.'],
            ['Targets Visceral Fat', 'Targets the dangerous internal fat around organs that diets often miss.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <span style={{ color: '#5C6B3A', fontWeight: 700, fontSize: 16, flexShrink: 0, marginTop: 1 }}>✓</span>
              <div><strong style={{ display: 'block', fontSize: 14, color: TEXT, marginBottom: 2 }}>{title}</strong><span style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{desc}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  CLINICAL DATA STRIP                                                       */
/* ════════════════════════════════════════════════════════════════════════════ */

function ClinicalData() {
  const stats = [
    { value: '10X', sub: 'MORE WEIGHT LOSS', desc: 'Proven to be 10x more effective than self-guided dieting over the same period.' },
    { value: '17X', sub: 'MORE FAT BURNED', desc: 'Significantly greater fat oxidation when the system is followed as designed.' },
    { value: '14%', sub: 'VISCERAL FAT DROP', desc: 'Targets the harmful internal fat linked to inflammation and chronic metabolic risk.' },
    { value: '98%', sub: 'MUSCLE RETAINED', desc: 'Protects your metabolic engine, ensuring the weight you lose stays off for good.' },
  ]
  return (
    <section style={{ background: PRIMARY, padding: '56px 24px' }}>
      <SectionLabel color={ACCENT}>Clinical Strength</SectionLabel>
      <h2 style={{ ...h2Style, color: '#fff', marginBottom: 40 }}>The Data Behind the System</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
        {stats.map(s => (
          <div key={s.sub} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 700, color: ACCENT, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: '#ffffffaa', marginTop: 6, marginBottom: 8 }}>{s.sub}</div>
            <div style={{ fontSize: 13, color: '#ffffff88', lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  WHAT MAKES THIS DIFFERENT                                                 */
/* ════════════════════════════════════════════════════════════════════════════ */

function WhatMakesThisDifferent() {
  return (
    <section style={{ maxWidth: 780, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, fontStyle: 'italic', color: PRIMARY, marginBottom: 24 }}>
        &ldquo;So What Makes This Different?&rdquo;
      </h2>
      <div style={{ fontSize: 15, color: MUTED, lineHeight: 1.8, maxWidth: 640, margin: '0 auto', marginBottom: 32 }}>
        <p style={{ marginBottom: 16 }}>You aren&apos;t questioning whether it works. We have millions of success stories and dozens of clinical studies that prove it does.</p>
        <p style={{ marginBottom: 16 }}>You aren&apos;t questioning the value. Most clients save money. If you could really buy optimal health and the life you want at this price, anyone would!</p>
        <p style={{ marginBottom: 16 }}>Here&apos;s the question you are asking... <strong style={{ color: TEXT }}>&ldquo;Can I really do this?&rdquo;</strong></p>
        <p>No one wants to invest money in another plan they might quit on. That is <strong style={{ color: TEXT }}>EXACTLY</strong> what makes this different. It was actually designed for that purpose. It was created to make sure you don&apos;t fail.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, maxWidth: 600, margin: '0 auto' }}>
        {[
          ['🎯', 'Simple', 'No Guesswork'],
          ['🤝', 'Coach', 'Accountability'],
          ['👥', 'Community', 'Power'],
          ['🔄', 'Habit', 'Installation'],
        ].map(([icon, line1, line2]) => (
          <div key={line1} style={{ background: '#fff', borderRadius: 14, padding: '20px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: PRIMARY }}>{line1}</div>
            <div style={{ fontSize: 12, color: MUTED }}>{line2}</div>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, fontStyle: 'italic', color: PRIMARY, marginTop: 32 }}>
        Finally, a plan created to MAKE SURE you win!!
      </p>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  THE 4 COMPONENTS                                                          */
/* ════════════════════════════════════════════════════════════════════════════ */

function FourComponents() {
  const items = [
    { icon: '🧭', title: '1:1 Coaching', desc: 'Your personal guide to navigate plateaus and stay consistent when life gets busy.' },
    { icon: '⚡', title: 'Habit Mastery', desc: "We don\u2019t just change what you eat; we install the daily habits for a lifetime of health." },
    { icon: '💬', title: 'Community', desc: 'Surround yourself with people on the same journey. Accountability is the secret sauce.' },
    { icon: '📐', title: 'Structure', desc: 'Scientifically formulated nutrition that takes the guesswork and stress out of your day.' },
  ]
  return (
    <section id="components" style={{ background: '#fff', padding: '64px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <SectionLabel>The 4 Components</SectionLabel>
        <h2 style={h2Style}>The Support Built To Keep You Winning</h2>
        <p style={{ textAlign: 'center', fontSize: 15, color: MUTED, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6 }}>
          This is why the results are so different. You aren&apos;t doing this alone.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {items.map(it => (
            <div key={it.title} style={{ background: BG, borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>{it.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: PRIMARY, marginBottom: 8 }}>{it.title}</h3>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  HOW THE 5&1 WORKS                                                         */
/* ════════════════════════════════════════════════════════════════════════════ */

function HowItWorks() {
  const schedule = [
    ['8:00 AM', 'Fueling #1'],
    ['10:30 AM', 'Fueling #2'],
    ['1:00 PM', 'Fueling #3'],
    ['3:30 PM', 'Fueling #4'],
    ['6:00 PM', 'Lean & Green Meal'],
    ['8:30 PM', 'Fueling #5'],
  ]
  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
      <SectionLabel>The Method</SectionLabel>
      <h2 style={h2Style}>How the Metabolic Reset (5&amp;1) Works</h2>
      <p style={{ textAlign: 'center', fontSize: 15, color: MUTED, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
        We remove the guesswork and decision fatigue. The structure is built for busy people who need results without the mental load.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 700, color: ACCENT, lineHeight: 1 }}>5</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: PRIMARY }}>Interchangeable Fuelings</div>
              <div style={{ fontSize: 13, color: MUTED }}>Eat every 2-3 hours. Nutrient-dense and designed to keep your metabolism steady.</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 700, color: ACCENT, lineHeight: 1 }}>1</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: PRIMARY }}>Lean &amp; Green&trade; Meal</div>
              <div style={{ fontSize: 13, color: MUTED }}>A whole-food meal featuring lean protein and three servings of vegetables.</div>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h4 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, marginBottom: 16 }}>An Example Day</h4>
          {schedule.map(([time, label], i) => (
            <div key={time} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < schedule.length - 1 ? `1px solid ${CARD_BORDER}` : 'none' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: label.includes('Lean') ? ACCENT : PRIMARY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, color: LIGHT_MUTED }}>{time}</span>
                <div style={{ fontWeight: 600, fontSize: 14, color: PRIMARY }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  FOOD CATEGORIES                                                           */
/* ════════════════════════════════════════════════════════════════════════════ */

const foodData: Record<string, string[]> = {
  'Grab-and-Go Bars': ['Campfire S\'mores Crisp', 'Caramel Delight Crisp', 'Chocolate Mint Cookie', 'Peanut Butter Chocolate Chip', 'Cranberry Honey Nut', 'Drizzled Berry Crisp', 'Lemon Tart Crisp'],
  'Hearty & Savory': ['Buttermilk Cheddar Mac', 'Red Bean & Veggie Chili', 'Garlic Mashed Potatoes', 'Sour Cream & Chive Potatoes', 'Rustic Tomato Herb Penne', 'Cheddar Biscuit Mix'],
  'Shakes & Smoothies': ['Creamy Chocolate & Vanilla', 'Caramel Macchiato', 'Rich Dark Chocolate', 'Strawberry Delight', 'Frothy Cappuccino', 'Mocha & Peanut Butter'],
  'Breakfast Favorites': ['Cinnamon & Berry O\'s', 'Golden Pancake Mix', 'Maple Brown Sugar Oatmeal', 'Apple Cinnamon Spiced Oatmeal', 'Blueberry Muffin Mix'],
  'Crunchy Snacks': ['BBQ & Pizza Crunchers', 'Nacho Cheese Poppers', 'Honey Mustard & Onion Sticks', 'Cinnamon Sugar Sticks'],
  'Decadent Desserts': ['Chocolate Fudge Pudding', 'Chocolate Brownie', 'Cinnamon Roll Cake', 'Mint Chocolate Soft Serve', 'Golden Butterscotch Blondie'],
}

const categoryIcons: Record<string, string> = {
  'Grab-and-Go Bars': '🍫',
  'Hearty & Savory': '🍲',
  'Shakes & Smoothies': '🥤',
  'Breakfast Favorites': '🥞',
  'Crunchy Snacks': '🥨',
  'Decadent Desserts': '🍰',
}

function FoodCategories() {
  const categories = Object.keys(foodData)
  const [active, setActive] = useState(categories[0])

  return (
    <section style={{ background: '#fff', padding: '64px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <SectionLabel>What Am I Actually Eating?</SectionLabel>
        <h2 style={h2Style}>Simple, delicious options designed to remove the &ldquo;what to eat&rdquo; stress.</h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 32, marginBottom: 28 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActive(cat)} style={{
              background: active === cat ? PRIMARY : BG,
              color: active === cat ? '#fff' : MUTED,
              fontSize: 12, fontWeight: 600, padding: '9px 18px', borderRadius: 8,
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}>
              {categoryIcons[cat]} {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {foodData[active].map(item => (
            <div key={item} style={{ background: BG, borderRadius: 12, padding: '14px 18px', fontSize: 14, fontWeight: 500, color: PRIMARY, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  TESTIMONIALS                                                              */
/* ════════════════════════════════════════════════════════════════════════════ */

function Testimonials() {
  const reviews = [
    { text: "The biggest win wasn\u2019t the weight. It was the energy to play with my kids after a 10-hour workday. I\u2019m finally the parent I wanted to be.", author: 'Sarah M.' },
    { text: "I tried every diet for 10 years. This is the only thing that taught me how to actually keep it off. The 5 & 1 is so simple it just works.", author: 'David R.' },
    { text: "My doctor was shocked. My blood markers are better than they were in my 20s. The visceral fat reduction is real.", author: 'Michael T.' },
  ]
  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
        {reviews.map(r => (
          <div key={r.author} style={cardStyle}>
            <div style={{ color: ACCENT, fontSize: 16, marginBottom: 12, letterSpacing: 2 }}>★★★★★</div>
            <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>&ldquo;{r.text}&rdquo;</p>
            <div style={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>— {r.author}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  THREE PHASES                                                              */
/* ════════════════════════════════════════════════════════════════════════════ */

function ThreePhases() {
  const phases = [
    { num: '1', title: 'Targeted Reset', desc: 'Focuses on visceral fat reduction and early habit installation. This is where you feel the initial metabolic shift.' },
    { num: '2', title: 'Refine', desc: 'Optimization of metabolic markers. We focus on muscle preservation and reinforcing your new lifestyle disciplines.' },
    { num: '3', title: 'Renew', desc: 'Lifelong longevity strategy. A personalized plan for sustainable metabolic freedom and flexibility.' },
  ]
  return (
    <section style={{ background: PRIMARY, padding: '64px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 700, fontStyle: 'italic', color: '#fff', marginBottom: 12 }}>
          The 3 Phases to Optimal Health
        </h2>
        <p style={{ fontSize: 14, color: '#ffffffaa', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6 }}>
          This isn&apos;t just about weight loss. It&apos;s about a sustainable life. Begin with Phase 1: Reset, move into Phase 2: Refine, then live in Phase 3: Renew.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {phases.map(p => (
            <div key={p.num} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px 24px', textAlign: 'left' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 700, color: ACCENT, lineHeight: 1 }}>{p.num}</span>
              <h3 style={{ fontWeight: 700, fontSize: 18, color: '#fff', margin: '12px 0 8px' }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: '#ffffffaa', lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  FAQ ACCORDION                                                             */
/* ════════════════════════════════════════════════════════════════════════════ */

const faqs = [
  { q: "What\u2019s the investment?", a: "This isn\u2019t an \u201cexpense.\u201d It\u2019s a reallocation of funds you\u2019re already spending. The plan is $364. That covers 4 weeks worth of your nutrition (115 meals), personalized app access, and your physical Habits of Health materials. Essentially, you are \u2018pre-paying\u2019 for your groceries. Most clients find that their grocery bill drops by $300\u2013$500." },
  { q: "I\u2019ve tried Keto/Paleo/Weight Watchers. Why is this different?", a: "This is a full system, not a diet. While those plans focus on what to eat, we focus on how you live. The 5&1 plan is designed to be low-glycemic, meaning you won\u2019t experience the \u2018hunger crashes\u2019 found in high-carb plans or the \u2018keto flu\u2019 intensity of others." },
  { q: 'Will I be hungry?', a: "For the first 2\u20133 days, you might feel some cravings as your body adjusts. However, once you hit \u2018fat-burning,\u2019 the frequent meals (every 2\u20133 hours) keep your stomach full and your blood sugar stable. Most people report being less hungry than they were on their old habits." },
  { q: 'What if I have high blood pressure or diabetes?', a: 'This program is designed to create a predictable glycemic response. Our plans support healthy blood markers, and have even been shown to help reverse conditions like diabetes, high blood pressure, cholesterol, and insulin resistance.' },
  { q: 'What if I travel or eat out?', a: 'The plan is designed for real life. Your Lean & Green meal can be ordered at any restaurant. Your fuelings are portable and require no refrigeration, so they go wherever you go.' },
  { q: "What if I can\u2019t cook or I\u2019m too busy?", a: "The Fuelings require zero cooking\u2014just add water or open the wrapper. Your one Lean & Green meal can be prepared in 15 minutes or ordered at any restaurant. This plan was built for people with high-demand careers." },
  { q: 'Is this safe long-term?', a: 'Absolutely. While Phase 1 (Reset) and Phase 2 (Refine) focus on weight loss & muscle mass, our program is designed to move you into Phase 3 (Renew), which is a lifelong strategy for longevity and metabolic freedom.' },
  { q: 'Can this work with GLP-1?', a: 'Many people use this lifestyle program alongside physician-supervised treatment to protect muscle mass and build the habits required to maintain results long-term.' },
]

function FAQ() {
  return (
    <section style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px' }}>
      <SectionLabel>Common Questions</SectionLabel>
      <h2 style={h2Style}>Everything you need to know before you start.</h2>
      <div style={{ marginTop: 32 }}>
        {faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
      </div>
    </section>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#fff', borderRadius: 14, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans', sans-serif" }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: PRIMARY }}>{q}</span>
        <span style={{ fontSize: 14, color: MUTED, flexShrink: 0, transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: '0 24px 18px', fontSize: 14, color: MUTED, lineHeight: 1.7 }}>{a}</div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  BOTTOM CTA                                                                */
/* ════════════════════════════════════════════════════════════════════════════ */

function BottomCTA() {
  return (
    <section style={{ maxWidth: 600, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 700, fontStyle: 'italic', color: PRIMARY, marginBottom: 16 }}>
        This could be exactly what you&apos;ve been looking for
      </h2>
      <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 12 }}>Ready to see if this is your fit?</p>
      <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'left', marginBottom: 24 }}>
        {[
          'Message the person who shared this page with you.',
          "Let them know you\u2019ve finished reading and you\u2019re ready to chat.",
          "They\u2019re ready to answer your questions and help you figure out if a Metabolic Reset is what your body needs to finally break the cycle.",
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: i < 2 ? `1px solid ${CARD_BORDER}` : 'none' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: PRIMARY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: 14, color: TEXT, lineHeight: 1.6 }}>{step}</span>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, fontStyle: 'italic', color: PRIMARY }}>Health is the ultimate legacy.</p>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  FOOTER                                                                    */
/* ════════════════════════════════════════════════════════════════════════════ */

function Footer() {
  return (
    <footer style={{ textAlign: 'center', padding: '32px 20px 40px', borderTop: `1px solid ${CARD_BORDER}` }}>
      <div style={{ fontSize: 11, color: LIGHT_MUTED }}>© My Metabolic Reboot · All rights reserved</div>
    </footer>
  )
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*  SHARED HELPERS                                                            */
/* ════════════════════════════════════════════════════════════════════════════ */

function SectionLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 12 }}>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: color || MUTED }}>{children}</span>
    </div>
  )
}

const h2Style: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 'clamp(24px, 5vw, 34px)',
  fontWeight: 700,
  fontStyle: 'italic',
  color: PRIMARY,
  textAlign: 'center',
  marginBottom: 8,
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  padding: '28px 24px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
}
