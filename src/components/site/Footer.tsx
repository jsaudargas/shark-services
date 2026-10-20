import { ArrowRight, MapPin, Phone } from 'lucide-react'
import { business } from '@/config/business'
import { services } from '@/config/services'
import { Link, requestHref } from '@/lib/router'
import { track } from '@/lib/analytics'
import { GlassLink } from '@/components/ui/Glass'
import { InstagramIcon, Wordmark } from '@/components/ui/Brand'

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-paper-2 pt-20">
      <div className="container-site">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Wordmark tone="dark" />
            <p className="mt-6 max-w-[22rem] text-[15px] leading-relaxed text-mute">
              Residential and commercial services across {business.area}. One call, multiple solutions.
            </p>
            <GlassLink href={requestHref()} variant="ink" className="mt-7">
              Get My Free Estimate <ArrowRight className="h-4 w-4" />
            </GlassLink>
          </div>

          <div>
            <p className="font-label text-[13px] font-semibold uppercase tracking-[0.16em] text-ink">Services</p>
            <ul className="mt-5 grid gap-2.5">
              {services
                .filter((s) => s.id !== 'other')
                .map((s) => (
                  <li key={s.id}>
                    <Link href={requestHref(s.id)} className="text-[14.5px] text-mute transition-colors hover:text-ink">
                      {s.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <p className="font-label text-[13px] font-semibold uppercase tracking-[0.16em] text-ink">Company</p>
            <ul className="mt-5 grid gap-2.5">
              {[
                { href: '/#how-it-works', label: 'How It Works' },
                { href: '/#why', label: 'Why S.H.A.R.K.' },
                { href: '/#faq', label: 'FAQ' },
                { href: requestHref(), label: 'Request an Estimate' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14.5px] text-mute transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-label text-[13px] font-semibold uppercase tracking-[0.16em] text-ink">Contact</p>
            <ul className="mt-5 grid gap-3.5 text-[14.5px]">
              <li>
                <a
                  href={business.phoneHref}
                  onClick={() => track('call_clicked', { location: 'footer' })}
                  className="inline-flex items-center gap-2.5 font-semibold text-ink hover:text-red"
                >
                  <Phone className="h-4 w-4 text-red" /> {business.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={business.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-mute hover:text-ink"
                >
                  <InstagramIcon className="h-4 w-4 text-red" /> {business.instagramHandle}
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5 text-mute">
                <MapPin className="h-4 w-4 text-red" /> {business.area}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 py-6 text-[13px] text-mute">
          <p>
            © {YEAR} {business.name}. All rights reserved.
          </p>
          <p>Website concept by Kodeborn</p>
        </div>
      </div>
      <p aria-hidden="true" className="display pointer-events-none text-ink/[0.045] -mb-[0.2em] select-none whitespace-nowrap text-center text-[19vw]">
        S.H.A.R.K.
      </p>
    </footer>
  )
}

/** Mobile-only sticky actions. Hidden inside the request funnel. */
export function MobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 md:hidden">
      <div className="lg flex gap-2 rounded-full p-1.5" style={{ '--lg-tint': 'rgba(11,13,16,0.82)' } as React.CSSProperties}>
        <a
          href={business.phoneHref}
          onClick={() => track('call_clicked', { location: 'mobile-bar' })}
          className="lg-btn lg h-12 flex-1 text-[14px] text-white"
        >
          <Phone className="h-4 w-4" /> Call
        </a>
        <Link href={requestHref()} className="lg-btn lg lg-red h-12 flex-[2] text-[14px] text-white">
          Get Free Estimate <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
