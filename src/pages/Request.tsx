import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, CircleAlert, Inbox, Info, LoaderCircle, Phone } from 'lucide-react'
import { business, DEMO_MODE } from '@/config/business'
import { isServiceId, serviceById, type Field } from '@/config/services'
import {
  describeAnswers,
  methodLabels,
  newLeadId,
  sortSlots,
  submitLead,
  timingLines,
  type AnswerValue,
  type Lead,
} from '@/lib/leads'
import { Link, useLocation } from '@/lib/router'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/cn'
import { firstName } from '@/lib/format'
import { GlassButton, GlassLink } from '@/components/ui/Glass'
import { Wordmark } from '@/components/ui/Brand'
import {
  autoAdvances,
  buildSteps,
  clearDraft,
  emptyDraft,
  loadDraft,
  saveDraft,
  stageLabels,
  validateStep,
  type Draft,
  type Step,
} from '@/funnel/model'
import { ContactStep, ReviewStep, ScreenStep, ServiceStep, StepHeader, TimingStep } from '@/funnel/steps'

interface State {
  draft: Draft
  stepKey: string
}

function firstInvalid(steps: Step[], draft: Draft) {
  const i = steps.findIndex((s) => Object.keys(validateStep(s, draft)).length > 0)
  return i === -1 ? steps.length - 1 : i
}

function initState(preselect: string | null): State {
  const saved = loadDraft()
  const draft = saved?.draft ?? emptyDraft()
  if (isServiceId(preselect)) {
    const steps = buildSteps(preselect)
    const resume = draft.service === preselect && saved?.stepKey && saved.stepKey !== 'service' ? saved.stepKey : steps[1].key
    return clampState({ draft: { ...draft, service: preselect }, stepKey: resume })
  }
  return clampState({ draft, stepKey: saved?.stepKey ?? 'service' })
}

/** never resume past the first step that still has missing answers */
function clampState(s: State): State {
  const steps = buildSteps(s.draft.service)
  let i = steps.findIndex((x) => x.key === s.stepKey)
  if (i === -1) i = 0
  i = Math.min(i, firstInvalid(steps, s.draft))
  return { ...s, stepKey: steps[i].key }
}

export function RequestPage() {
  const { search } = useLocation()
  const [state, setState] = useState<State>(() => initState(search.get('service')))
  const [attempted, setAttempted] = useState<Record<string, boolean>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [returnToReview, setReturnToReview] = useState(false)
  const [direction, setDirection] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState<{ lead: Lead; delivered: boolean } | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const reduceMotion = useReducedMotion()
  const honeypot = useRef<HTMLInputElement>(null)

  const { draft, stepKey } = state
  const steps = useMemo(() => buildSteps(draft.service), [draft.service])
  const index = Math.max(0, steps.findIndex((s) => s.key === stepKey))
  const step = steps[index]
  const service = serviceById(draft.service)
  const answers = (draft.service && draft.answers[draft.service]) || {}
  const errors = validateStep(step, draft)
  const shownErrors = attempted[step.key]
    ? errors
    : Object.fromEntries(Object.entries(errors).filter(([k]) => touched[k]))

  // ---- analytics
  useEffect(() => {
    track('funnel_started', { from: 'request-page', service: draft.service ?? undefined })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (step.kind === 'contact') track('contact_step_viewed', { service: draft.service ?? undefined })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.kind])

  // ---- autosave to this tab's sessionStorage (never sent anywhere)
  const firstSave = useRef(true)
  useEffect(() => {
    if (done) return
    const ok = saveDraft(draft, stepKey)
    if (firstSave.current) {
      firstSave.current = false
      return
    }
    if (!ok) return
    setSavedFlash(true)
    const t = setTimeout(() => setSavedFlash(false), 1200)
    return () => clearTimeout(t)
  }, [draft, stepKey, done])

  // ---- browser back/forward moves between steps
  const depth = useRef(0)
  useEffect(() => {
    window.history.replaceState({ fs: stepKey }, '')
    const onPop = (e: PopStateEvent) => {
      const fs = (e.state as { fs?: string } | null)?.fs
      if (typeof fs === 'string') {
        depth.current = Math.max(0, depth.current - 1)
        setDirection(-1)
        setState((s) => clampState({ ...s, stepKey: fs }))
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- focus the new step's title for keyboard and screen-reader users
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (step.kind === 'contact') return // the name field autofocuses instead
    const id = window.setTimeout(() => document.querySelector<HTMLElement>('[data-step-title]')?.focus({ preventScroll: true }), 60)
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
    return () => clearTimeout(id)
  }, [stepKey, step.kind, reduceMotion])

  const goTo = useCallback((key: string, dir: 1 | -1) => {
    setDirection(dir)
    setState((s) => ({ ...s, stepKey: key }))
    window.history.pushState({ fs: key }, '')
    depth.current += 1
  }, [])

  const next = () => {
    if (Object.keys(errors).length) {
      setAttempted((a) => ({ ...a, [step.key]: true }))
      // wait for the error messages to render, then bring the first one into view
      window.setTimeout(() => {
        const firstError = document.querySelector<HTMLElement>('form [aria-invalid="true"], form [role="alert"]')
        firstError?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' })
        if (firstError instanceof HTMLInputElement || firstError instanceof HTMLTextAreaElement) firstError.focus({ preventScroll: true })
      }, 30)
      return
    }
    if (step.kind === 'review') return void submit()
    if (returnToReview) {
      setReturnToReview(false)
      return goTo('review', 1)
    }
    goTo(steps[index + 1].key, 1)
  }
  const nextRef = useRef(next)
  nextRef.current = next

  const back = () => {
    if (index === 0) return
    setReturnToReview(false)
    if (depth.current > 0) {
      window.history.back()
    } else {
      setDirection(-1)
      const key = steps[index - 1].key
      setState((s) => ({ ...s, stepKey: key }))
      window.history.replaceState({ fs: key }, '')
    }
  }

  const advanceSoon = () => {
    window.setTimeout(() => nextRef.current(), reduceMotion ? 0 : 280)
  }

  // ---- draft setters
  const setAnswer = (id: string, v: AnswerValue) =>
    setState((s) => {
      const sid = s.draft.service
      if (!sid) return s
      return { ...s, draft: { ...s.draft, answers: { ...s.draft.answers, [sid]: { ...(s.draft.answers[sid] ?? {}), [id]: v } } } }
    })
  const setContact = (patch: Partial<Draft['contact']>) => setState((s) => ({ ...s, draft: { ...s.draft, contact: { ...s.draft.contact, ...patch } } }))
  const setTiming = (patch: Partial<Draft['timing']>) => setState((s) => ({ ...s, draft: { ...s.draft, timing: { ...s.draft.timing, ...patch } } }))

  const pickService = (id: string) => {
    if (!isServiceId(id)) return
    track('service_selected', { service: id })
    setState((s) => ({ ...s, draft: { ...s.draft, service: id } }))
    // keep ?service= in sync so a reload does not snap back to a previous choice
    window.history.replaceState(window.history.state, '', `/request?service=${id}`)
    advanceSoon()
  }

  const onSinglePicked = (field: Field, value: string) => {
    if (autoAdvances(step) && !returnToReview && value !== (field.type === 'single' ? field.otherValue : undefined)) advanceSoon()
  }

  const editFromReview = (key: string) => {
    setReturnToReview(true)
    goTo(key, -1)
  }

  // ---- submit
  const submit = async () => {
    if (!service || !draft.timing.mode) return
    setSubmitting(true)
    setSubmitError('')
    const { photos, ...rest } = answers
    const lead: Lead = {
      id: newLeadId(),
      createdAt: new Date().toISOString(),
      status: 'new',
      service: service.id,
      answers: rest,
      contact: {
        name: draft.contact.name.trim(),
        phone: draft.contact.phone,
        zip: draft.contact.zip,
        email: draft.contact.email.trim() || undefined,
        method: draft.contact.method,
        consent: draft.contact.consent,
      },
      timing: { mode: draft.timing.mode, slots: draft.timing.mode === 'times' ? sortSlots(draft.timing.slots) : [] },
      photos: (photos as string[] | undefined) ?? [],
      source: { page: '/request', utm: utmParams() },
    }
    const res = await submitLead(lead, honeypot.current?.value ?? '')
    setSubmitting(false)
    if (!res.ok) {
      setSubmitError("We couldn't send your request. Please try again, or call us directly.")
      return
    }
    track('service_request_submitted', { service: service.id, timing: lead.timing.mode, times: lead.timing.slots.length, photos: lead.photos.length })
    clearDraft()
    setDone({ lead, delivered: res.delivered })
    window.scrollTo(0, 0)
  }

  const startOver = () => {
    clearDraft()
    setDone(null)
    setAttempted({})
    setTouched({})
    setState({ draft: emptyDraft(), stepKey: 'service' })
    window.history.replaceState({ fs: 'service' }, '', '/request')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!submitting) next()
  }

  const allOptionalEmpty =
    step.kind === 'screen' &&
    step.screen.fields.every((f) => !f.required) &&
    step.screen.fields.every((f) => {
      const v = answers[f.id]
      return v == null || (Array.isArray(v) ? v.length === 0 : !v.trim())
    })

  // ---- step copy
  const copy = stepCopy(step, service?.name)
  const stepNumber = index + 1
  const bg = service?.image ?? '/images/hero.webp'

  return (
    <div className="relative min-h-[100svh] bg-ink text-white">
      {/* backdrop the glass refracts: the chosen service's photo, heavily dimmed */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.img
            key={bg}
            src={bg}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-[2px]"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,13,16,0.55)_0%,rgba(11,13,16,0.92)_45%,#0B0D10_100%)]" />
      </div>

      <FunnelHeader saved={savedFlash} />

      <main className="container-site relative grid gap-12 pb-28 pt-28 md:pt-32 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-20">
        {done ? (
          <Confirmation lead={done.lead} delivered={done.delivered} onStartOver={startOver} />
        ) : (
          <>
            <div className="min-w-0">
              <Progress stage={step.stage} index={index} steps={steps} />
              <p className="sr-only" aria-live="polite">
                Step {stepNumber} of {steps.length}: {copy.title}
              </p>

              <form onSubmit={onSubmit} noValidate className="mt-10">
                {/* spam trap: hidden from people, bots tend to fill it in */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label>
                    Leave this empty <input ref={honeypot} type="text" name="leave_this_empty" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={step.key}
                    custom={direction}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * -28 }}
                    transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <StepHeader
                      // the total is unknown until a service (and its questionnaire) is chosen
                      eyebrow={draft.service ? `Step ${stepNumber} of ${steps.length} · ${stageLabels[step.stage]}` : `Step 1 · ${stageLabels[0]}`}
                      title={copy.title}
                      sub={copy.sub}
                    />

                    {step.kind === 'service' && <ServiceStep value={draft.service} onPick={pickService} error={shownErrors.service} />}
                    {step.kind === 'screen' && (
                      <ScreenStep screen={step.screen} answers={answers} setAnswer={setAnswer} onSinglePicked={onSinglePicked} errors={shownErrors} />
                    )}
                    {step.kind === 'contact' && (
                      <ContactStep
                        contact={draft.contact}
                        set={setContact}
                        errors={shownErrors}
                        // only judge fields the visitor has typed in: an error appearing on blur of an
                        // empty field shifts the layout and swallows the click on Continue
                        onBlurField={(id) => {
                          const v = draft.contact[id as keyof Draft['contact']]
                          if (typeof v === 'string' && v.trim()) setTouched((t) => ({ ...t, [id]: true }))
                        }}
                      />
                    )}
                    {step.kind === 'timing' && (
                      <TimingStep
                        timing={draft.timing}
                        set={setTiming}
                        errors={shownErrors}
                        onModePicked={(m) => {
                          if (m !== 'times' && !returnToReview) advanceSoon()
                        }}
                      />
                    )}
                    {step.kind === 'review' && <ReviewStep draft={draft} onEdit={editFromReview} />}
                  </motion.div>
                </AnimatePresence>

                {submitError && (
                  <p role="alert" className="mt-6 flex items-center gap-2 rounded-2xl border border-[#FF6B6F]/40 bg-[#FF6B6F]/10 p-4 text-[14px] text-[#FFB3B5]">
                    <CircleAlert className="h-4 w-4 shrink-0" /> {submitError}
                  </p>
                )}

                <div className="mt-12 flex items-center justify-between gap-3 border-t border-white/10 pt-6">
                  {index > 0 ? (
                    <GlassButton onClick={back} variant="clear" size="md" style={{ '--lg-tint': 'rgba(255,255,255,0.05)' } as React.CSSProperties}>
                      <ArrowLeft className="h-4 w-4" /> Back
                    </GlassButton>
                  ) : (
                    <Link href="/" className="text-[14px] font-medium text-white/55 hover:text-white">
                      Cancel
                    </Link>
                  )}
                  <GlassButton type="submit" variant="red" size="lg" disabled={submitting} className="min-w-[12rem]">
                    {submitting ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" /> Sending…
                      </>
                    ) : step.kind === 'review' ? (
                      <>
                        Send My Service Request <ArrowRight className="h-[18px] w-[18px]" />
                      </>
                    ) : returnToReview ? (
                      <>
                        Save &amp; back to review <Check className="h-4 w-4" />
                      </>
                    ) : allOptionalEmpty ? (
                      <>
                        Skip this step <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Continue <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </GlassButton>
                </div>
              </form>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <Summary draft={draft} />
              </div>
            </aside>
          </>
        )}
      </main>
    </div>
  )
}

function stepCopy(step: Step, serviceName?: string): { title: string; sub?: string } {
  switch (step.kind) {
    case 'service':
      return { title: 'What can we help you with?', sub: 'Pick the closest match. You can describe the details next.' }
    case 'screen':
      return { title: step.screen.title, sub: step.screen.sub }
    case 'contact':
      return { title: 'Where should we reach you?', sub: `So the team can follow up about your ${serviceName?.toLowerCase() ?? 'request'} estimate.` }
    case 'timing':
      return { title: 'When would you like us to come by?', sub: 'Tell us what suits you. We confirm the exact time with you.' }
    case 'review':
      return { title: 'Does everything look right?', sub: 'Check the details, then send your request.' }
  }
}

function utmParams() {
  const q = new URLSearchParams(window.location.search)
  const out: Record<string, string> = {}
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid', 'gclid']) {
    const v = q.get(k)
    if (v) out[k] = v
  }
  return Object.keys(out).length ? out : undefined
}

/* ------------------------------------------------------------------ header */
function FunnelHeader({ saved }: { saved: boolean }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4">
      <div
        className="lg lg-soft mx-auto flex h-16 max-w-site items-center justify-between rounded-[20px] px-3 md:px-5"
        style={{ '--lg-blur': '16px', '--lg-tint': 'rgba(11,13,16,0.45)' } as React.CSSProperties}
      >
        <Link href="/" className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-[14px] font-medium text-white/65 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to site</span>
        </Link>
        <Link href="/" aria-label={`${business.name} home`} className="absolute left-1/2 -translate-x-1/2">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-3">
          <span
            className={cn('hidden items-center gap-1.5 text-[12.5px] font-medium text-emerald-300/90 transition-opacity duration-300 sm:inline-flex', saved ? 'opacity-100' : 'opacity-0')}
            aria-hidden={!saved}
          >
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
          <a
            href={business.phoneHref}
            onClick={() => track('call_clicked', { location: 'funnel-header' })}
            className="inline-flex items-center gap-2 rounded-full px-2 py-2 font-display text-[14px] font-semibold text-white"
            aria-label={`Call ${business.phoneDisplay}`}
          >
            <Phone className="h-4 w-4 text-red" /> <span className="hidden md:inline">{business.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </header>
  )
}

/* ---------------------------------------------------------------- progress */
function Progress({ stage, index, steps }: { stage: number; index: number; steps: Step[] }) {
  return (
    <div>
      <ol className="grid grid-cols-4 gap-2" aria-label="Progress">
        {stageLabels.map((label, s) => {
          const inStage = steps.map((st, i) => ({ st, i })).filter((x) => x.st.stage === s)
          const doneInStage = inStage.filter((x) => x.i < index).length
          const pct = s < stage ? 100 : s > stage ? 0 : ((doneInStage + 1) / (inStage.length + 1)) * 100
          return (
            <li key={label} aria-current={s === stage ? 'step' : undefined}>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-red transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
              </div>
              <p className={cn('mt-2.5 hidden font-label text-[13px] font-semibold uppercase tracking-[0.14em] sm:block', s <= stage ? 'text-white' : 'text-white/35')}>
                {s < stage && <Check className="-mt-0.5 mr-1 inline h-3.5 w-3.5 text-red" strokeWidth={3} />}
                {label}
              </p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ----------------------------------------------------------------- summary */
function Summary({ draft }: { draft: Draft }) {
  const service = serviceById(draft.service)
  const rows = service ? describeAnswers(service.id, draft.answers[service.id] ?? {}) : []
  const photos = service ? ((draft.answers[service.id]?.photos as string[] | undefined) ?? []) : []
  const c = draft.contact
  return (
    <div className="grid gap-3">
      <div className="lg rounded-[24px] p-6" style={{ '--lg-tint': 'rgba(255,255,255,0.05)', '--lg-blur': '18px' } as React.CSSProperties}>
        <p className="font-label text-[13px] font-semibold uppercase tracking-[0.18em] text-white/50">Your request</p>
        {service ? (
          <p className="mt-4 flex items-center gap-3 font-display text-[18px] font-bold tracking-[-0.01em]">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-red">
              <service.icon className="h-5 w-5" />
            </span>
            {service.name}
          </p>
        ) : (
          <p className="mt-4 text-[14.5px] text-white/45">Choose a service to get started.</p>
        )}

        {(rows.length > 0 || photos.length > 0) && (
          <dl className="mt-5 grid gap-2 border-t border-white/10 pt-5 text-[13.5px]">
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between gap-4">
                <dt className="shrink-0 text-white/45">{r.label}</dt>
                <dd className="line-clamp-2 text-right text-white/90">{r.value}</dd>
              </div>
            ))}
            {photos.length > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-white/45">Photos</dt>
                <dd className="text-white/90">{photos.length} added</dd>
              </div>
            )}
          </dl>
        )}

        {(c.name || c.phone) && (
          <dl className="mt-5 grid gap-2 border-t border-white/10 pt-5 text-[13.5px]">
            {c.name && (
              <div className="flex justify-between gap-4">
                <dt className="text-white/45">Name</dt>
                <dd className="truncate text-white/90">{c.name}</dd>
              </div>
            )}
            {c.phone && (
              <div className="flex justify-between gap-4">
                <dt className="text-white/45">Phone</dt>
                <dd className="text-white/90">{c.phone}</dd>
              </div>
            )}
          </dl>
        )}

        {draft.timing.mode && (
          <dl className="mt-5 grid gap-2 border-t border-white/10 pt-5 text-[13.5px]">
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-white/45">{draft.timing.mode === 'times' ? 'Available' : 'Preferred'}</dt>
              <dd className="grid gap-1 text-right text-white/90">
                {timingLines(draft.timing).map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </dd>
            </div>
          </dl>
        )}

        <ul className="mt-6 grid gap-2 border-t border-white/10 pt-5 text-[13px] text-white/65">
          {['Free estimate', 'About a minute to complete', 'Answers saved as you go'].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-red" strokeWidth={3} /> {t}
            </li>
          ))}
        </ul>
      </div>

      <a
        href={business.phoneHref}
        onClick={() => track('call_clicked', { location: 'funnel-summary' })}
        className="lg group flex items-center gap-4 rounded-[24px] p-5 transition-transform hover:scale-[1.01]"
        style={{ '--lg-tint': 'rgba(255,255,255,0.04)' } as React.CSSProperties}
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-red">
          <Phone className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-[13px] text-white/55">Need to speak with someone?</span>
          <span className="block font-display text-[16px] font-bold">Call {business.phoneDisplay}</span>
        </span>
      </a>
    </div>
  )
}

/* ------------------------------------------------------------ confirmation */
function Confirmation({ lead, delivered, onStartOver }: { lead: Lead; delivered: boolean; onStartOver: () => void }) {
  const service = serviceById(lead.service)
  const name = firstName(lead.contact.name)
  const reach =
    lead.contact.method === 'email' && lead.contact.email
      ? `Email · ${lead.contact.email}`
      : `${methodLabels[lead.contact.method]} · ${lead.contact.phone}`
  return (
    <section className="lg:col-span-2" aria-labelledby="confirm-title">
      <div className="mx-auto max-w-[760px]">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-red shadow-[0_0_0_10px_rgba(229,35,41,0.15)]">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path className="draw-check" d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h1 id="confirm-title" className="mt-9 font-display text-[clamp(2.2rem,4.6vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.035em]">
          Thanks{name ? `, ${name}` : ''}. {delivered ? 'Your request is in.' : 'Your request is ready.'}
        </h1>
        <p className="mt-5 max-w-[34rem] text-[17px] leading-relaxed text-white/65">
          The {business.name} team will review your request and contact you to confirm the details and which time works.
        </p>

        {!delivered && (
          <p className="mt-7 flex items-start gap-3 rounded-2xl border border-amber-300/30 bg-amber-300/[0.08] p-4 text-[14px] leading-relaxed text-amber-100/90">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <span>
              <b className="font-semibold">Demo mode:</b> this request was saved in this browser only. It has not been sent to {business.name}, and
              no email was sent. On the live site the owner gets every request by email.
            </span>
          </p>
        )}

        <dl className="lg mt-8 grid gap-px overflow-hidden rounded-[22px] sm:grid-cols-2" style={{ '--lg-tint': 'rgba(255,255,255,0.04)' } as React.CSSProperties}>
          {[
            ['Reference', lead.id],
            ['Service', service?.name ?? lead.service],
            [lead.timing.mode === 'times' ? 'Times you offered' : 'Preferred time', timingLines(lead.timing).join('\n')],
            ['We will reach you by', reach],
          ].map(([k, v]) => (
            <div key={k} className="p-5">
              <dt className="font-label text-[12.5px] font-semibold uppercase tracking-[0.16em] text-white/45">{k}</dt>
              <dd className="mt-1.5 whitespace-pre-line break-words font-display text-[16px] font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-9 flex flex-wrap gap-3">
          <GlassLink href={business.phoneHref} variant="red" size="lg" onClick={() => track('call_clicked', { location: 'confirmation' })}>
            <Phone className="h-4 w-4" /> Call {business.phoneDisplay}
          </GlassLink>
          <GlassLink href="/" variant="clear" size="lg" style={{ '--lg-tint': 'rgba(255,255,255,0.05)' } as React.CSSProperties}>
            Back to home
          </GlassLink>
          <GlassButton onClick={onStartOver} variant="clear" size="lg" style={{ '--lg-tint': 'rgba(255,255,255,0.05)' } as React.CSSProperties}>
            Start another request
          </GlassButton>
        </div>

        {DEMO_MODE && (
          <Link
            href="/demo/leads"
            className="mt-12 inline-flex items-center gap-2 rounded-full border border-dashed border-white/20 px-4 py-2.5 text-[13px] text-white/60 transition-colors hover:border-white/40 hover:text-white"
          >
            <Inbox className="h-4 w-4" /> Presenter: see this lead in the demo inbox <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </section>
  )
}
