// Minimal client router: three routes do not justify a routing library.
// Hostinger needs public/.htaccess to serve index.html for deep links.
import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react'

const NAV_EVENT = 'app:navigate'

const subscribe = (cb: () => void) => {
  window.addEventListener('popstate', cb)
  window.addEventListener(NAV_EVENT, cb)
  return () => {
    window.removeEventListener('popstate', cb)
    window.removeEventListener(NAV_EVENT, cb)
  }
}

const snapshot = () => window.location.pathname + window.location.search

export function useLocation() {
  const full = useSyncExternalStore(subscribe, snapshot, () => '/')
  const url = new URL(full, 'http://x')
  return { pathname: url.pathname.replace(/\/+$/, '') || '/', search: url.searchParams }
}

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  const url = new URL(to, window.location.href)
  const samePage = url.pathname === window.location.pathname && url.search === window.location.search
  if (opts.replace) window.history.replaceState(null, '', url)
  else window.history.pushState(null, '', url)
  window.dispatchEvent(new Event(NAV_EVENT))
  if (url.hash) {
    // wait for the target page to render before scrolling to the anchor
    requestAnimationFrame(() => document.getElementById(url.hash.slice(1))?.scrollIntoView())
  } else if (!samePage) {
    window.scrollTo(0, 0)
  }
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

export function Link({ href, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (!href.startsWith('/')) return
    e.preventDefault()
    navigate(href)
  }
  return <a href={href} onClick={handle} {...rest} />
}

export const requestHref = (service?: string) => (service ? `/request?service=${service}` : '/request')
