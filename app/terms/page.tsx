import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service & Disclosures — My Metabolic Reboot',
}

const green = {
  primary: '#00A651',
  dark: '#008C45',
  accent: '#7CB342',
  light: '#E8F5E9',
  pale: '#F4FAF6',
}
const text = { dark: '#1A2E1F', mid: '#3D5A45', muted: '#6B8A72' }
const border = '#C8E6C9'

function SectionBlock({ id, num, title, pill, children }: { id: string; num: string; title: string; pill?: { label: string; warn?: boolean }; children: React.ReactNode }) {
  return (
    <div id={id} style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: 12, padding: '36px 40px', marginBottom: 24, scrollMarginTop: 24 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: green.primary, opacity: 0.7, marginBottom: 4 }}>Section {num}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: text.dark, marginBottom: 20, paddingBottom: 14, borderBottom: `2px solid ${green.light}` }}>
        {title}
        {pill && (
          <span style={{ display: 'inline-block', fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', background: pill.warn ? '#F9A825' : green.primary, color: '#fff', padding: '2px 8px', borderRadius: 4, verticalAlign: 'middle', marginLeft: 10, position: 'relative', top: -2 }}>
            {pill.label}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function HighlightBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: green.light, border: `1px solid ${border}`, borderLeft: `4px solid ${green.primary}`, borderRadius: 8, padding: '16px 20px', margin: '18px 0', fontSize: 14, color: text.mid }}>
      {children}
    </div>
  )
}

const pStyle: React.CSSProperties = { marginBottom: 14, color: text.mid, lineHeight: 1.7, fontSize: 15 }
const ulStyle: React.CSSProperties = { paddingLeft: 20, marginBottom: 14, color: text.mid }
const liStyle: React.CSSProperties = { marginBottom: 6, fontSize: 14, lineHeight: 1.7 }
const h4Style: React.CSSProperties = { fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: green.dark, margin: '22px 0 8px' }

export default function TermsPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: green.pale, color: text.dark, lineHeight: 1.7, fontSize: 15 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap'); *, *::before, *::after { box-sizing: border-box; } a { color: ${green.primary}; }`}</style>

      {/* Header */}
      <header style={{ background: `linear-gradient(135deg, ${green.dark} 0%, ${green.primary} 60%, ${green.accent} 100%)`, padding: '48px 32px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>Legal Documents</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 700, color: '#fff', marginBottom: 8 }}>Terms of Service &amp; Disclosures</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', maxWidth: 500, margin: '0 auto' }}>My Metabolic Reboot — Independent Coach Business Management Platform</p>
        <span style={{ display: 'inline-block', marginTop: 16, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 20, padding: '4px 16px', fontSize: 11, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 }}>Last Updated: March 17, 2026</span>
      </header>

      {/* Disclaimer Banner */}
      <div style={{ background: '#FFF8E1', borderLeft: '5px solid #F9A825', borderBottom: '1px solid #F9E79F', padding: '20px 32px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>⚠️</span>
        <p style={{ fontSize: 13.5, color: '#5D4037', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
          <strong>Independent Tool Notice:</strong> This application is independently developed and operated. It is <strong>not</strong> affiliated with, endorsed by, sponsored by, or in any way officially connected to OPTAVIA LLC, Medifast, Inc., or any of their subsidiaries, affiliates, or representatives. OPTAVIA® is a registered trademark of Medifast, Inc.
        </p>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Table of Contents */}
        <div style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: 12, padding: '28px 32px', marginBottom: 48 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: green.dark, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>📋 Contents</div>
          <ol style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', padding: 0 }}>
            {[
              ['#independence', 'Independent Tool Disclosure'],
              ['#health', 'Health & Medical Disclaimer'],
              ['#acceptance', 'Acceptance of Terms'],
              ['#description', 'Description of Service'],
              ['#eligibility', 'Eligibility & User Responsibilities'],
              ['#ip', 'Intellectual Property'],
              ['#privacy', 'Privacy & Data'],
              ['#liability', 'Limitation of Liability'],
              ['#indemnification', 'Indemnification'],
              ['#termination', 'Termination'],
              ['#governing', 'Governing Law & Disputes'],
              ['#contact', 'Contact Information'],
            ].map(([href, label], i) => (
              <li key={href}>
                <a href={href} style={{ textDecoration: 'none', color: text.mid, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: green.primary, opacity: 0.7, minWidth: 20 }}>{String(i + 1).padStart(2, '0')}</span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* Section 1: Independence Disclosure */}
        <div id="independence" style={{ background: 'linear-gradient(135deg, #F4FAF6 0%, #E8F5E9 100%)', border: `2px solid ${green.primary}`, borderRadius: 14, padding: '36px 36px 32px', marginBottom: 24, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -12, left: 24, background: green.primary, color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: '3px 12px', borderRadius: 4 }}>⚠ IMPORTANT DISCLOSURE</div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: green.primary, opacity: 0.7, marginBottom: 4 }}>Section 01</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: text.dark, marginBottom: 16 }}>Independent Tool Disclosure</div>

          <p style={pStyle}><strong style={{ color: text.dark }}>This application ("My Metabolic Reboot," "the App," "the Platform," or "the Service") is an independently created, privately operated business management tool.</strong> It is designed to assist individual OPTAVIA health coaches in organizing their personal coaching practices.</p>

          <h4 style={h4Style}>What This App Is NOT:</h4>
          <ul style={ulStyle}>
            <li style={liStyle}><strong style={{ color: text.dark }}>Not affiliated with OPTAVIA LLC</strong> — This tool has no official relationship, partnership, or affiliation with OPTAVIA LLC, Medifast, Inc., or any parent, subsidiary, or affiliated company.</li>
            <li style={liStyle}><strong style={{ color: text.dark }}>Not sponsored or endorsed by OPTAVIA</strong> — OPTAVIA LLC has not reviewed, approved, sponsored, or endorsed this application or any content within it.</li>
            <li style={liStyle}><strong style={{ color: text.dark }}>Not an official OPTAVIA product</strong> — This is not an OPTAVIA corporate product, system, or platform. It is a third-party tool built independently.</li>
            <li style={liStyle}><strong style={{ color: text.dark }}>Not representative of OPTAVIA policies</strong> — Any guidance, scripts, or content within this App represents the independent views and practices of its operator and does not constitute official OPTAVIA guidance or policy.</li>
          </ul>

          <HighlightBox>
            <strong style={{ color: green.dark }}>Trademark Notice:</strong> OPTAVIA® and related marks are registered trademarks of Medifast, Inc. Their use in this application is solely for nominative reference purposes (to describe the business context of the coaching profession) and does not imply any affiliation, sponsorship, or endorsement.
          </HighlightBox>

          <p style={pStyle}>If you are an OPTAVIA coach, your primary compliance obligations remain with OPTAVIA LLC. Nothing in this application supersedes, modifies, or conflicts with your obligations under your OPTAVIA Independent Coach Agreement. You are solely responsible for ensuring that your use of this tool complies with all applicable OPTAVIA policies, guidelines, and your coach agreement.</p>
        </div>

        {/* Section 2: Health */}
        <SectionBlock id="health" num="02" title="Health & Medical Disclaimer" pill={{ label: 'Important', warn: true }}>
          <p style={pStyle}>This App is a <strong style={{ color: text.dark }}>business management and organizational tool</strong>. It is not a medical device, healthcare service, or clinical resource. Nothing in this App constitutes medical advice, diagnosis, or treatment.</p>
          <ul style={ulStyle}>
            <li style={liStyle}>All health-related content referenced in this App is provided for organizational and coaching support purposes only.</li>
            <li style={liStyle}>Users and their clients should always consult a licensed physician or qualified healthcare provider before beginning any nutritional or weight management program.</li>
            <li style={liStyle}>The App operator is not liable for any health outcomes arising from coaching activities conducted using this tool.</li>
            <li style={liStyle}>Official OPTAVIA program guidance supersedes any content found in this App. Always refer clients to official OPTAVIA resources and their personal healthcare providers for medical questions.</li>
          </ul>
        </SectionBlock>

        {/* Section 3: Acceptance */}
        <SectionBlock id="acceptance" num="03" title="Acceptance of Terms">
          <p style={pStyle}>By accessing or using My Metabolic Reboot platform, you (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Service.</p>
          <p style={pStyle}>We reserve the right to update these Terms at any time. Continued use of the Service following notice of changes constitutes your acceptance of the revised Terms. The &quot;Last Updated&quot; date at the top of this page reflects when changes were most recently made.</p>
          <p style={pStyle}>These Terms constitute a legally binding agreement between you and the operator of My Metabolic Reboot (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).</p>
        </SectionBlock>

        {/* Section 4: Description */}
        <SectionBlock id="description" num="04" title="Description of Service">
          <p style={pStyle}>My Metabolic Reboot is an independent, privately operated business management platform designed to help OPTAVIA health coaches organize and manage their coaching practice. The Service may include, but is not limited to:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Prospect and client pipeline management tools</li>
            <li style={liStyle}>Coach development and mentoring tracking</li>
            <li style={liStyle}>Communication scripts and templates for personal use</li>
            <li style={liStyle}>Training modules and resource libraries</li>
            <li style={liStyle}>Recipe databases and nutritional reference tools</li>
            <li style={liStyle}>Calendar and scheduling management</li>
          </ul>
          <HighlightBox>
            <strong style={{ color: green.dark }}>No Guarantee of Business Results:</strong> The tools, scripts, and resources provided in this App are offered as organizational aids only. We make no representation or warranty that use of this App will result in any specific business outcome, income level, or client result.
          </HighlightBox>
          <p style={pStyle}>We reserve the right to modify, suspend, or discontinue the Service (or any portion thereof) at any time, with or without notice.</p>
        </SectionBlock>

        {/* Section 5: Eligibility */}
        <SectionBlock id="eligibility" num="05" title="Eligibility & User Responsibilities">
          <h4 style={h4Style}>Eligibility</h4>
          <p style={pStyle}>You must be at least 18 years of age to use this Service. By using the App, you represent that you meet this requirement.</p>
          <h4 style={h4Style}>Your Responsibilities</h4>
          <ul style={ulStyle}>
            <li style={liStyle}>You are solely responsible for all activities conducted under your account.</li>
            <li style={liStyle}>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li style={liStyle}>You agree to use the Service only for lawful purposes and in compliance with all applicable laws and regulations.</li>
            <li style={liStyle}><strong style={{ color: text.dark }}>OPTAVIA Compliance:</strong> If you are an active OPTAVIA Independent Health Coach, you remain solely responsible for ensuring your use of this App and any materials derived from it comply with your OPTAVIA Independent Coach Agreement and all OPTAVIA policies and guidelines. This App operator accepts no responsibility for any disciplinary action, contract violation, or other consequence arising from your use of this App.</li>
            <li style={liStyle}>You agree not to misrepresent this tool as an official OPTAVIA product or system to clients, prospects, or other coaches.</li>
            <li style={liStyle}>You will not use this Service to store, transmit, or process sensitive personal health information of clients in violation of applicable privacy laws.</li>
          </ul>
        </SectionBlock>

        {/* Section 6: IP */}
        <SectionBlock id="ip" num="06" title="Intellectual Property">
          <p style={pStyle}>All content, design elements, code, scripts, training materials, and resources created by or for this App are the intellectual property of the App operator, unless otherwise noted. You are granted a limited, non-exclusive, non-transferable license to use these materials for your personal coaching business management purposes only.</p>
          <p style={pStyle}>You may not reproduce, distribute, publicly display, sell, sublicense, or create derivative works from the App&apos;s proprietary content without express written permission from the operator.</p>
          <p style={pStyle}>Third-party trademarks, including OPTAVIA® and Medifast®, remain the property of their respective owners and are referenced here solely for descriptive and nominative purposes.</p>
        </SectionBlock>

        {/* Section 7: Privacy */}
        <SectionBlock id="privacy" num="07" title="Privacy & Data">
          <p style={pStyle}>This App is designed with a <strong style={{ color: text.dark }}>privacy-first approach</strong>. We minimize the personal data collected and stored within the platform. By design, the App uses nicknames and labels rather than full identifying information for prospects and clients.</p>
          <h4 style={h4Style}>Data We May Collect</h4>
          <ul style={ulStyle}>
            <li style={liStyle}>Account registration information (name, email address)</li>
            <li style={liStyle}>Usage data and analytics to improve the Service</li>
            <li style={liStyle}>Coach-entered data (nicknames, pipeline stages, notes) — no sensitive personal health data should be entered</li>
          </ul>
          <h4 style={h4Style}>Your Obligations</h4>
          <p style={pStyle}>If you collect or process personal information about your prospects or clients through this App, you are responsible for obtaining all necessary consents and complying with all applicable privacy laws, including but not limited to CCPA and any applicable state privacy statutes.</p>
          <p style={pStyle}>This App is not designed to store Protected Health Information (PHI) as defined under HIPAA. Do not enter PHI into this platform.</p>
        </SectionBlock>

        {/* Section 8: Liability */}
        <SectionBlock id="liability" num="08" title="Limitation of Liability" pill={{ label: 'Read Carefully' }}>
          <p style={pStyle}>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE APP OPERATOR AND ITS REPRESENTATIVES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Loss of income or business opportunities</li>
            <li style={liStyle}>Loss of data or corruption of data</li>
            <li style={liStyle}>Any disciplinary action or contract penalties imposed by OPTAVIA LLC</li>
            <li style={liStyle}>Health outcomes of your clients or prospects</li>
            <li style={liStyle}>Any reliance on scripts, templates, or guidance provided in the App</li>
          </ul>
          <p style={pStyle}>IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU EXCEED THE AMOUNT YOU HAVE PAID TO US FOR THE SERVICE IN THE THREE (3) MONTHS PRECEDING THE CLAIM.</p>
          <p style={pStyle}>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
        </SectionBlock>

        {/* Section 9: Indemnification */}
        <SectionBlock id="indemnification" num="09" title="Indemnification">
          <p style={pStyle}>You agree to indemnify, defend, and hold harmless the App operator and its representatives from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys&apos; fees) arising out of or relating to:</p>
          <ul style={ulStyle}>
            <li style={liStyle}>Your use of the Service or violation of these Terms</li>
            <li style={liStyle}>Your violation of any OPTAVIA policy, guideline, or your Independent Coach Agreement</li>
            <li style={liStyle}>Your coaching activities with prospects and clients</li>
            <li style={liStyle}>Your violation of any third-party rights or applicable law</li>
            <li style={liStyle}>Any claim that your use of this App infringed any intellectual property or other rights</li>
          </ul>
        </SectionBlock>

        {/* Section 10: Termination */}
        <SectionBlock id="termination" num="10" title="Termination">
          <p style={pStyle}>We reserve the right to suspend or terminate your access to the Service at any time, for any reason, including but not limited to breach of these Terms, misrepresentation of the App as an official OPTAVIA product, or conduct that could expose us to legal liability.</p>
          <p style={pStyle}>You may terminate your account at any time by contacting us. Upon termination, your right to use the Service ceases immediately. Provisions of these Terms that by their nature should survive termination shall do so, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
        </SectionBlock>

        {/* Section 11: Governing Law */}
        <SectionBlock id="governing" num="11" title="Governing Law & Disputes">
          <p style={pStyle}>These Terms shall be governed by and construed in accordance with the laws of the State of Louisiana, without regard to its conflict of law provisions.</p>
          <p style={pStyle}>Any dispute arising out of or relating to these Terms or the Service shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be submitted to binding arbitration in St. Tammany Parish, Louisiana, under the rules of the American Arbitration Association. You waive any right to a jury trial or to participate in a class action lawsuit or class-wide arbitration.</p>
        </SectionBlock>

        {/* Section 12: Contact */}
        <SectionBlock id="contact" num="12" title="Contact Information">
          <p style={pStyle}>If you have questions about these Terms or this App&apos;s independence from OPTAVIA, please contact us:</p>
          <HighlightBox>
            <strong style={{ color: green.dark }}>My Metabolic Reboot</strong><br />
            Operated by Rogers Optimal Health<br />
            Covington, Louisiana<br />
            <br />
            <em>Note: This is an independent business and is not an OPTAVIA LLC contact address.</em>
          </HighlightBox>
          <p style={pStyle}>For official OPTAVIA program information, policies, or support, please visit <strong style={{ color: text.dark }}>optavia.com</strong> or contact OPTAVIA directly through their official channels.</p>
        </SectionBlock>

      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '32px 24px', borderTop: `1px solid ${border}`, marginTop: 40 }}>
        <p style={{ fontSize: 11.5, color: text.muted, maxWidth: 620, margin: '0 auto 8px' }}>© 2026 Rogers Optimal Health / My Metabolic Reboot. All rights reserved.</p>
        <p style={{ fontSize: 11.5, color: text.muted, maxWidth: 620, margin: '0 auto 8px' }}>OPTAVIA® is a registered trademark of Medifast, Inc. This application is not affiliated with, endorsed by, or in any way connected to OPTAVIA LLC or Medifast, Inc.</p>
        <p style={{ fontSize: 11.5, color: text.muted, maxWidth: 620, margin: '12px auto 0', fontStyle: 'italic' }}>These Terms were last updated March 17, 2026. This document does not constitute legal advice. Consult a qualified attorney for advice specific to your situation.</p>
      </footer>
    </div>
  )
}
