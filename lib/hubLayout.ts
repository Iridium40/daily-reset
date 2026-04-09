/**
 * Configurable client hub sections: titles + optional action buttons per section.
 * Stored on Organization as JSON (hubSectionsJson).
 */

export type HubActionButton = { label: string; url: string }

export type HubNavItem = { label: string; href: string }

export type HubStandardSection = {
  sectionTitle: string
  /** Optional heading inside the first card (onboarding / essentials only). */
  innerTitle?: string
  buttons: HubActionButton[]
}

export type HubWatchThisSection = {
  /** If empty, no section divider is shown above the card. */
  sectionTitle: string
  cardTagline: string
  cardTitle: string
  cardUrl: string
  buttons: HubActionButton[]
}

export type HubLayout = {
  nav: HubNavItem[]
  onboarding: HubStandardSection
  essentials: HubStandardSection
  communityZoom: HubStandardSection
  guides: HubStandardSection
  tips: HubStandardSection
  dailyVideos: HubStandardSection
  watchThis: HubWatchThisSection
  accountOrders: HubStandardSection
}

const emptyButtons: HubActionButton[] = []

export const DEFAULT_HUB_LAYOUT: HubLayout = {
  nav: [
    { label: 'Overview', href: '/overview' },
    { label: 'Daily Videos', href: '#mm-daily' },
    { label: 'Guides', href: '#mm-guides' },
    { label: 'Tips', href: '#mm-tips' },
    { label: 'Meal Planner', href: 'https://www.coachingamplifier.com/client/recipes' },
    { label: 'Referral', href: '#mm-referral' },
  ],
  onboarding: {
    sectionTitle: 'Your Onboarding Checklist',
    innerTitle: 'Before You Start',
    buttons: emptyButtons,
  },
  essentials: {
    sectionTitle: 'Program Essentials — Have These Ready',
    innerTitle: 'Checklist',
    buttons: emptyButtons,
  },
  communityZoom: {
    sectionTitle: 'Community Zoom Calls',
    buttons: emptyButtons,
  },
  guides: {
    sectionTitle: 'Reference Guides',
    buttons: emptyButtons,
  },
  tips: {
    sectionTitle: 'Metabolic Reset Tips',
    buttons: emptyButtons,
  },
  dailyVideos: {
    sectionTitle: 'Daily Videos',
    buttons: emptyButtons,
  },
  watchThis: {
    sectionTitle: '',
    cardTagline: 'Watch This',
    cardTitle: 'Join the mission. Make an impact. Earn as you go.',
    cardUrl: 'https://youtube.com/shorts/1P-KCIrQoEQ',
    buttons: emptyButtons,
  },
  accountOrders: {
    sectionTitle: 'Account & Orders',
    buttons: emptyButtons,
  },
}

function sanitizeButton(b: unknown): HubActionButton | null {
  if (!b || typeof b !== 'object') return null
  const o = b as Record<string, unknown>
  const label = typeof o.label === 'string' ? o.label.trim().slice(0, 120) : ''
  const url = typeof o.url === 'string' ? o.url.trim().slice(0, 2048) : ''
  // Keep draft rows that aren't fully filled yet (otherwise save + reload drops them silently).
  if (!label && !url) return null
  return { label, url }
}

function sanitizeNavItem(n: unknown): HubNavItem | null {
  if (!n || typeof n !== 'object') return null
  const o = n as Record<string, unknown>
  const label = typeof o.label === 'string' ? o.label.trim().slice(0, 80) : ''
  const href = typeof o.href === 'string' ? o.href.trim().slice(0, 2048) : ''
  if (!label && !href) return null
  return { label, href }
}

function mergeStandard(def: HubStandardSection, patch: unknown): HubStandardSection {
  if (!patch || typeof patch !== 'object') return { ...def, buttons: [...def.buttons] }
  const p = patch as Record<string, unknown>
  const buttons = Array.isArray(p.buttons)
    ? (p.buttons.map(sanitizeButton).filter(Boolean) as HubActionButton[]).slice(0, 15)
    : [...def.buttons]
  return {
    sectionTitle: typeof p.sectionTitle === 'string' ? p.sectionTitle.slice(0, 200) : def.sectionTitle,
    innerTitle:
      p.innerTitle === undefined
        ? def.innerTitle
        : typeof p.innerTitle === 'string'
          ? p.innerTitle.slice(0, 200)
          : def.innerTitle,
    buttons,
  }
}

function mergeWatch(def: HubWatchThisSection, patch: unknown): HubWatchThisSection {
  if (!patch || typeof patch !== 'object') return { ...def, buttons: [...def.buttons] }
  const p = patch as Record<string, unknown>
  const buttons = Array.isArray(p.buttons)
    ? (p.buttons.map(sanitizeButton).filter(Boolean) as HubActionButton[]).slice(0, 15)
    : [...def.buttons]
  return {
    sectionTitle: typeof p.sectionTitle === 'string' ? p.sectionTitle.slice(0, 200) : def.sectionTitle,
    cardTagline: typeof p.cardTagline === 'string' ? p.cardTagline.slice(0, 120) : def.cardTagline,
    cardTitle: typeof p.cardTitle === 'string' ? p.cardTitle.slice(0, 300) : def.cardTitle,
    cardUrl: typeof p.cardUrl === 'string' ? p.cardUrl.trim().slice(0, 2048) : def.cardUrl,
    buttons,
  }
}

/** Merge stored JSON with defaults. Safe for null/invalid JSON. */
export function parseHubLayout(json: string | null | undefined): HubLayout {
  let raw: unknown = null
  if (json && typeof json === 'string') {
    try {
      raw = JSON.parse(json) as unknown
    } catch {
      raw = null
    }
  }
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  // Preserve explicit [] (cleared nav). Only substitute defaults when `nav` is missing or not an array.
  let nav: HubNavItem[]
  if (!Array.isArray(r.nav)) {
    nav = [...DEFAULT_HUB_LAYOUT.nav]
  } else {
    nav = r.nav.map(sanitizeNavItem).filter((x): x is HubNavItem => x !== null).slice(0, 12)
  }

  return {
    nav,
    onboarding: mergeStandard(DEFAULT_HUB_LAYOUT.onboarding, r.onboarding),
    essentials: mergeStandard(DEFAULT_HUB_LAYOUT.essentials, r.essentials),
    communityZoom: mergeStandard(DEFAULT_HUB_LAYOUT.communityZoom, r.communityZoom),
    guides: mergeStandard(DEFAULT_HUB_LAYOUT.guides, r.guides),
    tips: mergeStandard(DEFAULT_HUB_LAYOUT.tips, r.tips),
    dailyVideos: mergeStandard(DEFAULT_HUB_LAYOUT.dailyVideos, r.dailyVideos),
    watchThis: mergeWatch(DEFAULT_HUB_LAYOUT.watchThis, r.watchThis),
    accountOrders: mergeStandard(DEFAULT_HUB_LAYOUT.accountOrders, r.accountOrders),
  }
}

export function serializeHubLayout(layout: HubLayout): string {
  return JSON.stringify({
    nav: layout.nav,
    onboarding: layout.onboarding,
    essentials: layout.essentials,
    communityZoom: layout.communityZoom,
    guides: layout.guides,
    tips: layout.tips,
    dailyVideos: layout.dailyVideos,
    watchThis: layout.watchThis,
    accountOrders: layout.accountOrders,
  })
}
