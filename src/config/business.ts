// Single source of truth for business facts. Only verified details from the
// client's own materials go here. Anything unconfirmed stays out of the UI.

export const business = {
  name: 'S.H.A.R.K. Services',
  shortName: 'S.H.A.R.K.',
  area: 'Long Island, New York',
  areaShort: 'Long Island, NY',
  phoneDisplay: '(516) 244-8782',
  phoneHref: 'tel:+15162448782',
  smsHref: 'sms:+15162448782',
  instagramHandle: '@s.h.a.r.kservices',
  instagramUrl: 'https://www.instagram.com/s.h.a.r.kservices/',
  // No email address was provided by the client. Leave null until confirmed.
  email: null as string | null,
} as const

// Demo mode (default): submissions are stored in this browser only
// (localStorage) and are NOT sent to the business.
// Live mode: build with VITE_LEAD_ENDPOINT=/api/lead.php so each request is
// POSTed to the PHP mailer in public/api, which emails the owner.
export const leadEndpoint: string | undefined = import.meta.env.VITE_LEAD_ENDPOINT || undefined
export const DEMO_MODE = !leadEndpoint
/** Also keep a copy in the browser-local demo inbox (handy for sales demos). */
export const mirrorToDemoInbox = import.meta.env.VITE_DEMO_INBOX === 'on'
