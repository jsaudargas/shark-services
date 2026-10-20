import { ArrowRight, ArrowUpRight, Check, Phone } from 'lucide-react'
import { business } from '@/config/business'
import { services } from '@/config/services'
import { Link, requestHref } from '@/lib/router'
import { track } from '@/lib/analytics'
import { GlassLink } from '@/components/ui/Glass'

const promises = ['Free Estimates', 'Multiple Services, One Call', 'Flexible Scheduling']

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-white">
      <img
        src="/images/hero.webp"
        alt=""
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_50%]"
      />
      {/* legibility: heavy on the copy side, open on the photo side */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,13,16,0.94)_0%,rgba(11,13,16,0.78)_38%,rgba(11,13,16,0.25)_75%,rgba(11,13,16,0.35)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-ink to-transparent" />

      <div className="container-site flex flex-1 flex-col justify-end pb-10 pt-32 md:pb-14">
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_420px] xl:gap-20">
          <div>
            <p className="hero-in flex items-center gap-3 font-label text-[14px] font-semibold uppercase tracking-[0.22em] text-fg-mute">
              <span className="h-px w-8 bg-red" />
              {business.areaShort} · Residential &amp; Commercial
            </p>
            <h1 className="display hero-in mt-6 text-[clamp(2.9rem,5.6vw,5.5rem)]" style={{ '--d': '80ms' } as React.CSSProperties}>
              Need something <br className="hidden sm:block" />
              done? <span className="block text-red">We handle it.</span>
            </h1>
            <p className="hero-in mt-7 max-w-[34rem] text-[17px] leading-relaxed text-white/75 md:text-[18px]" style={{ '--d': '160ms' } as React.CSSProperties}>
              From junk removal and handyman jobs to mechanical repairs and property maintenance, {business.name} helps Long Island get the job done.
            </p>
            <div className="hero-in mt-9 flex flex-wrap items-center gap-3" style={{ '--d': '240ms' } as React.CSSProperties}>
              <GlassLink href={requestHref()} variant="red" size="lg" onClick={() => track('funnel_started', { from: 'hero' })}>
                Get My Free Estimate <ArrowRight className="h-[18px] w-[18px]" />
              </GlassLink>
              <GlassLink href={business.phoneHref} variant="clear" size="lg" onClick={() => track('call_clicked', { location: 'hero' })}>
                <Phone className="h-4 w-4" /> Call {business.phoneDisplay}
              </GlassLink>
            </div>
            <ul className="hero-in mt-9 flex flex-wrap gap-x-7 gap-y-3" style={{ '--d': '320ms' } as React.CSSProperties}>
              {promises.map((p) => (
                <li key={p} className="flex items-center gap-2 text-[14.5px] font-medium text-white/85">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-red">
                    <Check className="h-3 w-3" strokeWidth={3.5} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick service selector: one tap opens the right questionnaire */}
          <div
            className="hero-in lg rounded-[26px] p-5 md:p-6"
            style={{ '--d': '380ms', '--lg-tint': 'rgba(11,13,16,0.45)', '--lg-blur': '18px' } as React.CSSProperties}
          >
            <div className="flex items-baseline justify-between">
              <p className="font-display text-[19px] font-bold tracking-[-0.01em]">What do you need help with?</p>
            </div>
            <p className="mt-1 text-[13.5px] text-white/60">Pick one to start your free estimate.</p>
            <ul className="mt-5 grid grid-cols-2 gap-2">
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    href={requestHref(s.id)}
                    onClick={() => track('funnel_started', { from: 'hero-picker', service: s.id })}
                    className="group flex h-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 transition-colors hover:border-red/70 hover:bg-red/15"
                  >
                    <s.icon className="h-[18px] w-[18px] shrink-0 text-red transition-colors group-hover:text-white" strokeWidth={2} />
                    <span className="min-w-0 flex-1 text-[13.5px] font-semibold leading-tight">{s.id === 'other' ? 'Something else' : s.name.replace(' Services', '')}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
