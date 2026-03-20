/**
 * Editable hub body content (checklists, guides, hero, cards).
 * Stored on Organization.hubContentJson — merged with DEFAULT_HUB_CONTENT.
 */

export type OnboardingItem = {
  label: string
  sub?: string
  linkText?: string
  linkUrl?: string
  /** When true, button uses org Facebook URL from admin; row hidden if URL empty. */
  linkToFacebook?: boolean
}

export type EssentialItem = {
  emoji?: string
  label: string
  sub?: string
  linkText?: string
  linkUrl?: string
  outlineButton?: boolean
}

export type GuideRow = { emoji: string; name: string; url: string }
export type TipRow = { emoji: string; title: string; desc: string; url: string }
export type DailyDay = { day: string; label: string; url: string }

export type OrderStep = { title: string; body: string }

export type HubContent = {
  onboarding: OnboardingItem[]
  essentials: EssentialItem[]
  guides: GuideRow[]
  tips: TipRow[]
  quickStart: { url: string; tagline: string; title: string }
  nightBefore: { emoji: string; tagline: string; title: string; sub: string; url: string }
  dailyVideoDays: DailyDay[]
  orderEdit: {
    title: string
    sub: string
    icon: string
    calloutLead: string
    videoUrl: string
    videoLinkText: string
    steps: OrderStep[]
  }
  referral: {
    title: string
    sub: string
    icon: string
    steps: string[]
    warnings: string[]
    successNote: string
  }
  completionMessages: {
    onboardComplete: string
    essentialsComplete: string
  }
}

export const DEFAULT_HUB_CONTENT: HubContent = {
  onboarding: [
    { label: 'Watch Element 1 video', sub: '"Being Clear Why You\'re Here"', linkText: 'Watch →', linkUrl: 'https://vimeo.com/670494023/69cfa64553' },
    { label: 'Write your WHYs', sub: 'Take a photo holding it and send to your coach' },
    { label: 'Take before photos', sub: 'Front, back, and side — you\'ll want these later' },
    { label: 'Download the Optavia app', sub: 'Recipes, reminders, and tracking', linkText: 'Get App', linkUrl: 'https://apps.apple.com/us/app/optavia/id1477201061' },
    { label: 'Join the private Facebook group', sub: 'Introduce yourself so we can support you', linkText: 'Join →', linkToFacebook: true },
  ],
  essentials: [
    { emoji: '🥩', label: 'Food Scale', sub: 'To weigh lean protein — essential.' },
    { emoji: '⚖️', label: 'Body Composition Scale', sub: 'Digital is best. We recommend the RENPHO scale.', linkText: 'Amazon →', linkUrl: 'https://www.amazon.com/RENPHO-Bluetooth-Bathroom-Composition-Smartphone/dp/B01N1UX8RW', outlineButton: true },
    { emoji: '📏', label: 'Measuring Tape', sub: "Track inches lost — the scale doesn't show the full picture." },
  ],
  guides: [
    { emoji: '📘', name: 'Optavia Guide', url: 'https://optaviamedia.com/pdf/LEARN/32240-GUI_OPTAVIA-Guide.pdf' },
    { emoji: '🥦', name: 'Vegetable Conversion Chart', url: 'https://optaviamedia.com/pdf/LEARN/OPTAVIA-Vegetarian_Conversion_Chart.pdf' },
    { emoji: '🧴', name: 'Condiments + Healthy Fats', url: 'https://optaviamedia.com/pdf/LEARN/OPTAVIA_CondimentSheet.pdf' },
    { emoji: '🌿', name: 'Vegetarian Info Sheet', url: 'https://optaviamedia.com/pdf/learn/OPTAVIA-Vegetarian-Info-Sheet.pdf' },
    { emoji: '🍽️', name: 'Dining Out Guide', url: 'https://optaviamedia.com/pdf/learn/50054-GUI_OPTAVIA-Dining-Out.pdf' },
  ],
  tips: [
    { emoji: '🔬', title: 'The Reset Explained', desc: "Understand how the metabolic reset works and why it's effective", url: 'https://www.themetabolicmission.com/resetexplained' },
    { emoji: '🍷', title: 'Alcohol & the Reset', desc: 'What you need to know about alcohol during your program', url: 'https://www.themetabolicmission.com/alcohol' },
    { emoji: '🏃', title: 'Working Out During the Reset', desc: 'How to exercise safely and effectively while on the program', url: 'https://www.themetabolicmission.com/workingout' },
  ],
  quickStart: {
    url: 'https://vimeo.com/835524024?share=copy',
    tagline: 'Start here — 7 min',
    title: 'Watch the Quick Start Video',
  },
  nightBefore: {
    emoji: '🌙',
    tagline: 'Start Here',
    title: 'Night Before You Begin',
    sub: 'Prep your environment. Set expectations. Start clean.',
    url: 'https://hohdigitallibrary.com/nightbefore',
  },
  dailyVideoDays: [
    { day: 'Day 1', label: 'Kickoff', url: 'https://hohdigitallibrary.com/day1' },
    { day: 'Day 2', label: 'Build Momentum', url: 'https://hohdigitallibrary.com/day2' },
    { day: 'Day 3', label: 'Dial In Basics', url: 'https://hohdigitallibrary.com/day3' },
    { day: 'Day 4', label: 'Stay Consistent', url: 'https://hohdigitallibrary.com/day4' },
    { day: 'Day 5', label: 'Win the Weekend', url: 'https://hohdigitallibrary.com/day5' },
    { day: 'Day 6', label: "Don't Overthink", url: 'https://hohdigitallibrary.com/day6' },
    { day: 'Day 7', label: 'Finish Week One', url: 'https://hohdigitallibrary.com/day7' },
    { day: 'Day 8', label: 'Lock It In', url: 'https://hohdigitallibrary.com/day8' },
  ],
  orderEdit: {
    title: 'How to Edit Your Order',
    sub: 'Important to know',
    icon: '📦',
    calloutLead: '📹 Watch the short video first —',
    videoUrl: 'https://vimeo.com/user20141625/updateorder',
    videoLinkText: 'Watch Order Update Video →',
    steps: [
      { title: 'Log in at optavia.com', body: 'Open your Account Dashboard. Temp password: Welcome1! (capital W + !)' },
      { title: 'Update your fuelings', body: 'Remove the kit and add at least 20 individual boxes. Stay in the Optavia Essential line.' },
      { title: 'Optional add-ons', body: 'Lifebook, Habits of Health, microwavable lean & green meals, hydration, snacks.' },
      { title: 'Stack your savings', body: '10% off over $250 · 15% off over $350' },
    ],
  },
  referral: {
    title: 'Share the Plan. Earn Credit.',
    sub: 'Client Referral Program',
    icon: '🎁',
    steps: [
      'Find your link in the Client App and share it',
      'Your friend must click your link first — before anything else',
      'They complete the referral form through your link',
      'Same email on the form must be used for their account',
      'Account created after the form is submitted',
      'Friend places their qualifying order',
      'Order must ship before credit activates',
      'Referral credit confirmed after shipment',
    ],
    warnings: ['No link click = no credit', 'No form submission = no credit', 'Email mismatch = no credit'],
    successNote: 'Credit applies after order ships, not when placed',
  },
  completionMessages: {
    onboardComplete: "Onboarding complete! You're ready to go.",
    essentialsComplete: "You've got everything you need!",
  },
}

function clampStr(s: unknown, max: number): string {
  if (typeof s !== 'string') return ''
  return s.slice(0, max)
}

function parseOnboarding(arr: unknown): OnboardingItem[] {
  if (!Array.isArray(arr)) return [...DEFAULT_HUB_CONTENT.onboarding]
  return arr
    .map((x): OnboardingItem | null => {
      if (!x || typeof x !== 'object') return null
      const o = x as Record<string, unknown>
      const label = clampStr(o.label, 300)
      if (!label) return null
      return {
        label,
        sub: o.sub !== undefined ? clampStr(o.sub, 500) : undefined,
        linkText: o.linkText !== undefined ? clampStr(o.linkText, 80) : undefined,
        linkUrl: o.linkUrl !== undefined ? clampStr(o.linkUrl, 2048) : undefined,
        linkToFacebook: o.linkToFacebook === true,
      }
    })
    .filter(Boolean) as OnboardingItem[]
}

function parseEssentials(arr: unknown): EssentialItem[] {
  if (!Array.isArray(arr)) return [...DEFAULT_HUB_CONTENT.essentials]
  return arr
    .map((x): EssentialItem | null => {
      if (!x || typeof x !== 'object') return null
      const o = x as Record<string, unknown>
      const label = clampStr(o.label, 300)
      if (!label) return null
      return {
        emoji: o.emoji !== undefined ? clampStr(o.emoji, 8) : undefined,
        label,
        sub: o.sub !== undefined ? clampStr(o.sub, 500) : undefined,
        linkText: o.linkText !== undefined ? clampStr(o.linkText, 80) : undefined,
        linkUrl: o.linkUrl !== undefined ? clampStr(o.linkUrl, 2048) : undefined,
        outlineButton: o.outlineButton === true,
      }
    })
    .filter(Boolean) as EssentialItem[]
}

function mergeHubContent(patch: unknown): HubContent {
  const d = DEFAULT_HUB_CONTENT
  if (!patch || typeof patch !== 'object') return JSON.parse(JSON.stringify(d)) as HubContent
  const p = patch as Record<string, unknown>

  const orderEdit = p.orderEdit && typeof p.orderEdit === 'object' ? (p.orderEdit as Record<string, unknown>) : {}
  const referral = p.referral && typeof p.referral === 'object' ? (p.referral as Record<string, unknown>) : {}
  const quickStart = p.quickStart && typeof p.quickStart === 'object' ? (p.quickStart as Record<string, unknown>) : {}
  const nightBefore = p.nightBefore && typeof p.nightBefore === 'object' ? (p.nightBefore as Record<string, unknown>) : {}
  const completionMessages = p.completionMessages && typeof p.completionMessages === 'object' ? (p.completionMessages as Record<string, unknown>) : {}

  const ob = parseOnboarding(p.onboarding)
  const es = parseEssentials(p.essentials)
  return {
    onboarding: ob.length ? ob : [...d.onboarding],
    essentials: es.length ? es : [...d.essentials],
    guides: Array.isArray(p.guides) && p.guides.length ? (p.guides as GuideRow[]).slice(0, 30) : [...d.guides],
    tips: Array.isArray(p.tips) && p.tips.length ? (p.tips as TipRow[]).slice(0, 30) : [...d.tips],
    quickStart: {
      url: clampStr(quickStart.url, 2048) || d.quickStart.url,
      tagline: clampStr(quickStart.tagline, 120) || d.quickStart.tagline,
      title: clampStr(quickStart.title, 200) || d.quickStart.title,
    },
    nightBefore: {
      emoji: clampStr(nightBefore.emoji, 8) || d.nightBefore.emoji,
      tagline: clampStr(nightBefore.tagline, 120) || d.nightBefore.tagline,
      title: clampStr(nightBefore.title, 200) || d.nightBefore.title,
      sub: clampStr(nightBefore.sub, 500) || d.nightBefore.sub,
      url: clampStr(nightBefore.url, 2048) || d.nightBefore.url,
    },
    dailyVideoDays:
      Array.isArray(p.dailyVideoDays) && p.dailyVideoDays.length
        ? (p.dailyVideoDays as DailyDay[]).slice(0, 30)
        : [...d.dailyVideoDays],
    orderEdit: {
      title: clampStr(orderEdit.title, 200) || d.orderEdit.title,
      sub: clampStr(orderEdit.sub, 200) || d.orderEdit.sub,
      icon: clampStr(orderEdit.icon, 8) || d.orderEdit.icon,
      calloutLead: clampStr(orderEdit.calloutLead, 200) || d.orderEdit.calloutLead,
      videoUrl: clampStr(orderEdit.videoUrl, 2048) || d.orderEdit.videoUrl,
      videoLinkText: clampStr(orderEdit.videoLinkText, 120) || d.orderEdit.videoLinkText,
      steps: Array.isArray(orderEdit.steps) && orderEdit.steps.length
        ? (orderEdit.steps as OrderStep[]).slice(0, 20)
        : [...d.orderEdit.steps],
    },
    referral: {
      title: clampStr(referral.title, 200) || d.referral.title,
      sub: clampStr(referral.sub, 200) || d.referral.sub,
      icon: clampStr(referral.icon, 8) || d.referral.icon,
      steps: Array.isArray(referral.steps) && referral.steps.length ? (referral.steps as string[]).slice(0, 30) : [...d.referral.steps],
      warnings: Array.isArray(referral.warnings) ? (referral.warnings as string[]).slice(0, 20) : [...d.referral.warnings],
      successNote: clampStr(referral.successNote, 300) || d.referral.successNote,
    },
    completionMessages: {
      onboardComplete: clampStr(completionMessages.onboardComplete, 300) || d.completionMessages.onboardComplete,
      essentialsComplete: clampStr(completionMessages.essentialsComplete, 300) || d.completionMessages.essentialsComplete,
    },
  }
}

export function parseHubContent(json: string | null | undefined): HubContent {
  if (!json || typeof json !== 'string') return JSON.parse(JSON.stringify(DEFAULT_HUB_CONTENT)) as HubContent
  try {
    return mergeHubContent(JSON.parse(json) as unknown)
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_HUB_CONTENT)) as HubContent
  }
}

export function serializeHubContent(c: HubContent): string {
  return JSON.stringify(c)
}

/** Resolve onboarding rows for display + checklist count (excludes Facebook row when no URL). */
export function resolveOnboardingItems(items: OnboardingItem[], facebookUrl: string | null | undefined) {
  const fb = facebookUrl?.trim() || ''
  const resolved: { label: string; sub?: string; link?: { href: string; text: string } }[] = []
  for (const item of items) {
    if (item.linkToFacebook) {
      if (!fb) continue
      resolved.push({
        label: item.label,
        sub: item.sub,
        link: { href: fb, text: item.linkText || 'Join →' },
      })
      continue
    }
    if (item.linkUrl && item.linkText) {
      resolved.push({ label: item.label, sub: item.sub, link: { href: item.linkUrl, text: item.linkText } })
      continue
    }
    resolved.push({ label: item.label, sub: item.sub })
  }
  return resolved
}
