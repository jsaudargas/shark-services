import { useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ClipboardList,
  Building2,
  Minus,
  PhoneCall,
  Plus,
  Phone,
  ReceiptText,
  Layers3,
} from 'lucide-react'
import { business } from '@/config/business'
import { services } from '@/config/services'
import { Link, requestHref } from '@/lib/router'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/cn'
import { GlassLink } from '@/components/ui/Glass'
import { Fin } from '@/components/ui/Brand'

const d = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties

/* ------------------------------------------------------------------ marquee */
export function ServiceMarquee() {
  const names = services.filter((s) => s.id !== 'other').map((s) => s.name)
  // 4 copies: always wider than 2x the viewport, so the loop never shows a gap
  const row = [...names, ...names, ...names, ...names]
  return (
    <div className="overflow-hidden border-b border-line bg-white py-6" aria-hidden="true">
      <div className="flex w-max animate-marquee items-center motion-reduce:animate-none">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center">
            {row.map((n, i) => (
              <span key={`${half}-${i}`} className="flex items-center whitespace-nowrap">
                <span className="px-7 font-display text-[22px] font-bold uppercase tracking-[-0.01em] text-ink/25">{n}</span>
                <Fin className="h-3.5 w-3.5 text-red/70" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- services */
export function ServicesGrid() {
  return (
    <section id="services" className="bg-paper py-24 md:py-32">
      <div className="container-site">
        <div className="grid gap-8 md:grid-cols-[180px_minmax(0,1fr)] md:gap-0">
          <div data-reveal>
            <span className="tag">Services</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <h2 data-reveal className="max-w-[16ch] font-display text-[clamp(2.2rem,4.2vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.035em]">
              What do you need help with?
            </h2>
            <p data-reveal style={d(80)} className="max-w-[24rem] text-[16px] leading-relaxed text-mute">
              Seven services, one crew to call. Pick yours and answer a few quick questions. It takes about a minute.
            </p>
          </div>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => {
            const other = s.id === 'other'
            return (
              <li key={s.id} data-reveal style={d((i % 4) * 70)}>
                <Link
                  href={requestHref(s.id)}
                  onClick={() => track('funnel_started', { from: 'services-grid', service: s.id })}
                  className={cn(
                    'group flex h-full flex-col rounded-[22px] border p-2.5 transition-[transform,border-color] duration-300 hover:-translate-y-1',
                    other ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink/25',
                  )}
                >
                  <div className={cn('relative aspect-[4/3] overflow-hidden rounded-[16px]', other ? 'hatch bg-ink-3' : 'bg-paper-2')}>
                    {s.image ? (
                      <img
                        src={s.image}
                        alt=""
                        loading="lazy"
                        width={900}
                        height={640}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="flex h-full flex-col justify-between p-5">
                        <s.icon className="h-9 w-9 text-red" strokeWidth={1.6} />
                        <p className="font-display text-[15px] font-semibold leading-snug text-white/80">
                          Not on the list? <br />
                          Describe it anyway.
                        </p>
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 font-label text-[12px] font-semibold tracking-[0.12em] text-white backdrop-blur">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col px-2.5 pb-2 pt-4">
                    <div className="flex items-center gap-2.5">
                      <s.icon className={cn('h-[18px] w-[18px]', other ? 'text-red' : 'text-red')} strokeWidth={2.1} />
                      <h3 className="font-display text-[17px] font-bold tracking-[-0.015em]">{s.name}</h3>
                    </div>
                    <p className={cn('mt-2 text-[14px] leading-relaxed', other ? 'text-white/60' : 'text-mute')}>{s.short}</p>
                    <span
                      className={cn(
                        'lg-btn mt-auto h-10 w-full justify-between px-4 text-[13px]',
                        other ? 'lg lg-red text-white' : 'lg lg-light text-ink',
                      )}
                      style={{ marginTop: 18 }}
                    >
                      {other ? 'Describe the job' : 'Get estimate'}
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- how it works */
const steps = [
  {
    icon: ClipboardList,
    title: 'Tell us what you need',
    body: 'Choose a service and answer a few quick questions. Add photos if you have them.',
  },
  {
    icon: CalendarClock,
    title: 'Choose a preferred time',
    body: 'As soon as possible, a specific day, or whenever works. You tell us what suits you.',
  },
  {
    icon: PhoneCall,
    title: "We'll confirm the details",
    body: 'The team reviews your request and contacts you to confirm the estimate and the time.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-ink py-24 text-white md:py-32">
      <div className="hatch pointer-events-none absolute -right-24 top-0 h-full w-[38%] [mask-image:linear-gradient(90deg,transparent,black)]" />
      <div className="container-site relative">
        <div className="grid gap-8 md:grid-cols-[180px_minmax(0,1fr)] md:gap-0">
          <div data-reveal>
            <span className="tag tag-dark">How it works</span>
          </div>
          <div>
            <h2 data-reveal className="max-w-[18ch] font-display text-[clamp(2.2rem,4.2vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.035em]">
              Three steps. No back-and-forth.
            </h2>

            <ol className="mt-16 grid gap-px overflow-hidden rounded-[22px] border border-line-dark bg-line-dark md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} data-reveal style={d(i * 90)} className="relative flex flex-col bg-ink-2 p-7 md:p-8">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[56px] font-extrabold leading-none tracking-[-0.05em] text-white/[0.09]">
                      0{i + 1}
                    </span>
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-red/15 text-red">
                      <s.icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="mt-10 font-display text-[20px] font-bold tracking-[-0.02em]">{s.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-fg-mute">{s.body}</p>
                </li>
              ))}
            </ol>

            <div data-reveal className="mt-8 flex flex-wrap items-center justify-between gap-6">
              <p className="max-w-[34rem] text-[14.5px] leading-relaxed text-fg-mute">
                You're sending a request, not locking in a slot. Every time is confirmed with you personally before anyone shows up.
              </p>
              <GlassLink href={requestHref()} variant="red" size="md" onClick={() => track('funnel_started', { from: 'how-it-works' })}>
                Start my request <ArrowRight className="h-4 w-4" />
              </GlassLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------- why */
const values = [
  { icon: Layers3, title: 'One call, multiple solutions', body: 'Junk, repairs, engines, snow, vents, HVAC. One number for all of it.' },
  { icon: ReceiptText, title: 'Free estimates', body: 'Tell us about the job and get an estimate before you commit to anything.' },
  { icon: CalendarClock, title: 'Flexible scheduling', body: 'Pick the timing that works for you and the team fits around it.' },
  { icon: Building2, title: 'Residential & commercial', body: 'Homes, rentals, storefronts and lots across Long Island.' },
]

export function WhyShark() {
  return (
    <section id="why" className="bg-white py-24 md:py-32">
      <div className="container-site">
        <div className="grid gap-8 md:grid-cols-[180px_minmax(0,1fr)] md:gap-0">
          <div data-reveal>
            <span className="tag">Why S.H.A.R.K.</span>
          </div>
          <div>
            <h2 data-reveal className="max-w-[20ch] font-display text-[clamp(2.2rem,4.2vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.035em]">
              One call. <span className="text-mute-2">Multiple solutions.</span>
            </h2>
            <p data-reveal style={d(80)} className="mt-8 max-w-[38rem] text-[17px] leading-relaxed text-mute">
              Most people need three or four different contractors to keep a property running. {business.name} covers the hauling, the fixing and
              the seasonal work, so you only have to explain the job once.
            </p>
          </div>
        </div>

        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <li key={v.title} data-reveal style={d(i * 70)} className="rounded-[22px] border border-line bg-paper p-7">
              <v.icon className="h-6 w-6 text-red" strokeWidth={1.9} />
              <h3 className="mt-8 font-display text-[18px] font-bold tracking-[-0.02em]">{v.title}</h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-mute">{v.body}</p>
            </li>
          ))}
        </ul>

        {/* photo band, like the reference's dark roofing card */}
        <div data-reveal className="relative mt-6 overflow-hidden rounded-[26px] bg-ink text-white">
          <img src="/images/band-workbench.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[60%_40%]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,13,16,0.92)_0%,rgba(11,13,16,0.65)_45%,rgba(11,13,16,0.1)_100%)]" />
          <div className="relative flex min-h-[420px] flex-col justify-end p-8 md:p-14">
            <p className="font-label text-[14px] font-semibold uppercase tracking-[0.22em] text-red">Our approach</p>
            <p className="display mt-4 max-w-[13ch] text-[clamp(2.3rem,4.6vw,4.2rem)]">We don't circle the job. We handle it.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <GlassLink href={requestHref()} variant="red" onClick={() => track('funnel_started', { from: 'why-band' })}>
                Get My Free Estimate <ArrowRight className="h-4 w-4" />
              </GlassLink>
              <GlassLink href={business.phoneHref} variant="clear" onClick={() => track('call_clicked', { location: 'why-band' })}>
                <Phone className="h-4 w-4" /> {business.phoneDisplay}
              </GlassLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------- faq */
const faqs = [
  {
    q: 'Are estimates really free?',
    a: 'Yes. Send a request with a few details about the job and the team will get back to you with an estimate. There is no charge for the estimate itself.',
  },
  {
    q: 'Is my appointment confirmed when I send the form?',
    a: 'Not yet. The form sends a request with your preferred time. The team reviews it and contacts you to confirm the details and the time before any work is scheduled.',
  },
  {
    q: 'Do you work with commercial properties?',
    a: 'Yes. S.H.A.R.K. Services handles both residential and commercial jobs. Choose your property type in the request form.',
  },
  {
    q: 'Where do you work?',
    a: 'Long Island, New York. Enter your ZIP code in the request and the team will confirm if your location is covered.',
  },
  {
    q: "My job isn't listed. Can you still help?",
    a: 'Choose "Something Else" and describe the job in your own words. The team will let you know if it is something they can take on.',
  },
]

export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="bg-paper py-24 md:py-32">
      <div className="container-site max-w-[900px]">
        <div className="text-center">
          <span data-reveal className="tag">Ask us anything</span>
          <h2 data-reveal style={d(60)} className="mt-5 font-display text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.05] tracking-[-0.035em]">
            Frequently asked questions
          </h2>
        </div>
        <div data-reveal className="mt-12 grid gap-2.5">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q} className={cn('rounded-[18px] border bg-white transition-colors', isOpen ? 'border-ink/20' : 'border-line')}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left font-display text-[16px] font-semibold tracking-[-0.01em]"
                  >
                    {f.q}
                    <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors', isOpen ? 'bg-red text-white' : 'bg-paper text-ink')}>
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={!isOpen} className="px-6 pb-6 text-[15px] leading-relaxed text-mute">
                  {f.a}
                </div>
              </div>
            )
          })}
        </div>
        <div data-reveal className="mt-10 flex justify-center">
          <GlassLink href={business.phoneHref} variant="light" onClick={() => track('call_clicked', { location: 'faq' })}>
            <Phone className="h-4 w-4 text-red" /> Still unsure? Call {business.phoneDisplay}
          </GlassLink>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- final cta */
export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-28 text-white md:py-36">
      <img src="/images/band-toolwall.webp" alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(11,13,16,0.72)_0%,rgba(11,13,16,0.93)_70%)]" />
      <div className="container-site text-center">
        <h2 data-reveal className="display mx-auto max-w-[14ch] text-[clamp(2.6rem,6vw,5.6rem)]">
          Got a job that needs <span className="text-red">handling?</span>
        </h2>
        <p data-reveal style={d(80)} className="mx-auto mt-6 max-w-[30rem] text-[18px] text-white/70">
          Tell us what you need. We'll take it from there.
        </p>
        <div data-reveal style={d(160)} className="mt-10 flex flex-wrap justify-center gap-3">
          <GlassLink href={requestHref()} variant="red" size="lg" onClick={() => track('funnel_started', { from: 'final-cta' })}>
            Get My Free Estimate <ArrowRight className="h-[18px] w-[18px]" />
          </GlassLink>
          <GlassLink href={business.phoneHref} variant="clear" size="lg" onClick={() => track('call_clicked', { location: 'final-cta' })}>
            <Phone className="h-4 w-4" /> Call Now
          </GlassLink>
        </div>
      </div>
    </section>
  )
}
