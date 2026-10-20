import { useEffect, useState } from 'react'
import { ArrowRight, Menu, Phone, X } from 'lucide-react'
import { business } from '@/config/business'
import { cn } from '@/lib/cn'
import { Link, requestHref } from '@/lib/router'
import { track } from '@/lib/analytics'
import { GlassLink } from '@/components/ui/Glass'
import { Wordmark } from '@/components/ui/Brand'

const nav = [
  { href: '/#services', label: 'Services' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#why', label: 'Why Us' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact' },
]

export function Header() {
  // over the hero the bar is clear glass; past it, it turns milky for contrast
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setSolid(window.scrollY > window.innerHeight * 0.82))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const light = solid && !open

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4">
      <div
        className={cn(
          'lg lg-soft mx-auto flex h-16 max-w-site items-center justify-between rounded-[20px] pl-5 pr-2.5 transition-colors duration-300',
          light && 'lg-light',
        )}
        style={{ '--lg-blur': '16px', '--lg-tint': light ? 'rgba(248,248,246,0.72)' : 'rgba(11,13,16,0.22)' } as React.CSSProperties}
      >
        <Link href="/" aria-label={`${business.name} home`} className="shrink-0">
          <Wordmark tone={light ? 'dark' : 'light'} />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={cn(
                    'rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors',
                    light ? 'text-ink/70 hover:bg-ink/5 hover:text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white',
                  )}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={business.phoneHref}
            onClick={() => track('call_clicked', { location: 'header' })}
            className={cn(
              'hidden items-center gap-2 rounded-full px-3 py-2 font-display text-[14px] font-semibold md:inline-flex',
              light ? 'text-ink hover:bg-ink/5' : 'text-white hover:bg-white/10',
            )}
          >
            <Phone className="h-4 w-4 text-red" strokeWidth={2.4} />
            {business.phoneDisplay}
          </a>
          <GlassLink href={requestHref()} variant="red" size="sm" className="hidden h-11 px-5 sm:inline-flex">
            Get Free Estimate <ArrowRight className="h-4 w-4" />
          </GlassLink>
          <a
            href={business.phoneHref}
            aria-label={`Call ${business.phoneDisplay}`}
            className={cn('grid h-11 w-11 place-items-center rounded-full md:hidden', light ? 'text-ink' : 'text-white')}
          >
            <Phone className="h-5 w-5" />
          </a>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className={cn('grid h-11 w-11 place-items-center rounded-full lg:hidden', light ? 'text-ink' : 'text-white')}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="lg mx-auto mt-2 max-w-site rounded-[20px] p-3 lg:hidden" style={{ '--lg-tint': 'rgba(11,13,16,0.86)' } as React.CSSProperties}>
          <ul className="grid">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3.5 font-display text-[17px] font-semibold text-white hover:bg-white/10"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <GlassLink href={requestHref()} variant="red" size="lg" className="mt-2 w-full" onClick={() => setOpen(false)}>
            Get My Free Estimate <ArrowRight className="h-4 w-4" />
          </GlassLink>
        </div>
      )}
    </header>
  )
}
