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

// Demo mode: submissions are stored in this browser only (localStorage) and
// are NOT sent to the business. Set VITE_LEAD_WEBHOOK_URL to deliver for real.
export const leadWebhookUrl: string | undefined = import.meta.env.VITE_LEAD_WEBHOOK_URL || undefined
export const DEMO_MODE = !leadWebhookUrl
