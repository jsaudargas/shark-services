// Analytics abstraction. Local-only until a real endpoint is configured:
// events are logged in dev and pushed to window.dataLayer only when
// VITE_ANALYTICS=on (e.g. once GA4/GTM is installed). Never pass personal data.

export type FunnelEvent =
  | 'funnel_started'
  | 'service_selected'
  | 'contact_step_viewed'
  | 'service_request_submitted'
  | 'call_clicked'

type Props = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

export function track(event: FunnelEvent, props: Props = {}) {
  if (import.meta.env.DEV) console.debug('[analytics]', event, props)
  if (import.meta.env.VITE_ANALYTICS === 'on') {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event, ...props })
  }
}
