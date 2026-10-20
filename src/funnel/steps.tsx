import { CalendarDays, Hourglass, Lock, MapPin, Pencil, Phone, Shuffle, Zap } from 'lucide-react'
import { business } from '@/config/business'
import { serviceById, services, type Field, type Screen } from '@/config/services'
import { describeAnswers, describeTiming, methodLabels, windowLabels, type AnswerValue, type ContactMethod, type TimeWindow } from '@/lib/leads'
import { formatUsPhone, isValidZip, looksLikeLongIsland } from '@/lib/format'
import { cn } from '@/lib/cn'
import { ChoiceCards, ErrorText, Pills, PhotoField, TextArea, TextField, VolumeCards } from './controls'
import { DatePicker } from './DatePicker'
import type { Draft, Errors } from './model'

/* ------------------------------------------------------------------ shell */
export function StepHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mb-9">
      <p className="font-label text-[14px] font-semibold uppercase tracking-[0.2em] text-red">{eyebrow}</p>
      <h1 data-step-title tabIndex={-1} className="mt-3 font-display text-[clamp(2rem,3.6vw,2.9rem)] font-bold leading-[1.04] tracking-[-0.035em] text-white outline-none">
        {title}
      </h1>
      {sub && <p className="mt-3.5 max-w-[36rem] text-[16px] leading-relaxed text-white/60">{sub}</p>}
    </div>
  )
}

/* ---------------------------------------------------------------- service */
export function ServiceStep({ value, onPick, error }: { value: string | null; onPick: (id: string) => void; error?: string }) {
  return (
    <>
      <ChoiceCards
        label="Service"
        options={services.map((s) => ({ value: s.id, label: s.name, hint: s.short, icon: s.icon }))}
        selected={value ? [value] : []}
        onToggle={onPick}
      />
      <ErrorText>{error}</ErrorText>
    </>
  )
}

/* ------------------------------------------------------- questionnaire */
export function ScreenStep({
  screen,
  answers,
  setAnswer,
  onSinglePicked,
  errors,
}: {
  screen: Screen
  answers: Record<string, AnswerValue>
  setAnswer: (id: string, v: AnswerValue) => void
  onSinglePicked: (field: Field, value: string) => void
  errors: Errors
}) {
  const textFields = screen.fields.filter((f) => f.type === 'text')
  return (
    <div className="grid gap-8">
      {textFields.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {textFields.map((f) =>
            f.type === 'text' ? (
              <div key={f.id}>
                <TextField
                  label={f.label}
                  optional={!f.required}
                  placeholder={f.placeholder}
                  inputMode={f.inputMode}
                  maxLength={f.id === 'year' ? 4 : 60}
                  list={f.list ? `${f.id}-list` : undefined}
                  value={(answers[f.id] as string) ?? ''}
                  onChange={(e) => setAnswer(f.id, f.inputMode === 'numeric' ? e.target.value.replace(/\D/g, '') : e.target.value)}
                  error={errors[f.id]}
                  autoComplete="off"
                />
                {f.list && (
                  <datalist id={`${f.id}-list`}>
                    {f.list.map((o) => (
                      <option key={o} value={o} />
                    ))}
                  </datalist>
                )}
              </div>
            ) : null,
          )}
        </div>
      )}

      {screen.fields.map((f) => {
        if (f.type === 'text') return null
        const v = answers[f.id]
        const otherKey = `${f.id}__other`

        if (f.type === 'single' || f.type === 'multi') {
          const selected = Array.isArray(v) ? v : v ? [v] : []
          const toggle = (val: string) => {
            if (f.type === 'multi') {
              setAnswer(f.id, selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val])
            } else {
              setAnswer(f.id, val)
              onSinglePicked(f, val)
            }
          }
          const showOther = !!f.otherValue && selected.includes(f.otherValue)
          return (
            <div key={f.id}>
              {f.type === 'single' && f.layout === 'volume' ? (
                <VolumeCards label={f.label} options={f.options} value={v as string} onPick={toggle} />
              ) : f.type === 'single' && f.layout === 'pills' ? (
                <Pills label={f.label} options={f.options} selected={selected} onToggle={toggle} />
              ) : (
                <ChoiceCards label={f.label} options={f.options} selected={selected} onToggle={toggle} multi={f.type === 'multi'} cols={f.options.length > 4 ? 3 : 2} />
              )}
              {showOther && (
                <TextField
                  className="mt-5 max-w-[30rem]"
                  label="Tell us a little more"
                  placeholder={f.otherPlaceholder}
                  value={(answers[otherKey] as string) ?? ''}
                  onChange={(e) => setAnswer(otherKey, e.target.value)}
                  autoFocus
                />
              )}
              <ErrorText>{errors[f.id]}</ErrorText>
            </div>
          )
        }

        if (f.type === 'textarea')
          return (
            <TextArea
              key={f.id}
              label={f.label}
              optional={!f.required}
              value={(v as string) ?? ''}
              onChange={(val) => setAnswer(f.id, val)}
              placeholder={f.placeholder}
              suggestions={f.suggestions}
              error={errors[f.id]}
            />
          )

        if (f.type === 'photos')
          return <PhotoField key={f.id} label={f.label} max={f.max} value={(v as string[]) ?? []} onChange={(val) => setAnswer(f.id, val)} />

        return null
      })}
    </div>
  )
}

/* ---------------------------------------------------------------- contact */
export function ContactStep({
  contact,
  set,
  errors,
  onBlurField,
}: {
  contact: Draft['contact']
  set: (patch: Partial<Draft['contact']>) => void
  errors: Errors
  onBlurField: (id: string) => void
}) {
  const zipNote = isValidZip(contact.zip) && !looksLikeLongIsland(contact.zip)
  return (
    <div className="grid gap-5">
      <TextField
        label="Your name"
        autoComplete="name"
        placeholder="First and last name"
        value={contact.name}
        onChange={(e) => set({ name: e.target.value })}
        onBlur={() => onBlurField('name')}
        error={errors.name}
        autoFocus
      />
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <TextField
          label="Mobile number"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(516) 000-0000"
          value={contact.phone}
          onChange={(e) => set({ phone: formatUsPhone(e.target.value) })}
          onBlur={() => onBlurField('phone')}
          error={errors.phone}
        />
        <TextField
          label="ZIP code"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="11735"
          maxLength={5}
          value={contact.zip}
          onChange={(e) => set({ zip: e.target.value.replace(/\D/g, '').slice(0, 5) })}
          onBlur={() => onBlurField('zip')}
          error={errors.zip}
          hint={
            zipNote ? (
              <span className="flex items-center gap-1.5 text-amber-300/90">
                <MapPin className="h-3.5 w-3.5" /> Outside our usual area? Send it anyway and we'll let you know.
              </span>
            ) : undefined
          }
        />
      </div>
      <TextField
        label="Email"
        optional
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={contact.email}
        onChange={(e) => set({ email: e.target.value })}
        onBlur={() => onBlurField('email')}
        error={errors.email}
      />
      <div>
        <p className="mb-2.5 text-[14px] font-semibold text-white">Best way to reach you</p>
        <Pills
          label="Preferred contact method"
          size="md"
          options={(['call', 'text', 'email'] as ContactMethod[]).map((m) => ({ value: m, label: methodLabels[m] }))}
          selected={[contact.method]}
          onToggle={(m) => set({ method: m as ContactMethod })}
        />
      </div>

      <div className="mt-1">
        <label className="flex cursor-pointer items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <input
            type="checkbox"
            checked={contact.consent}
            onChange={(e) => set({ consent: e.target.checked })}
            aria-invalid={!!errors.consent}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#E52329]"
          />
          <span className="text-[14px] leading-relaxed text-white/75">
            I agree that {business.name} may contact me by call, text or email about this service request. Message and data rates may apply.
          </span>
        </label>
        <ErrorText>{errors.consent}</ErrorText>
      </div>
      <p className="flex items-center gap-2 text-[13px] text-white/45">
        <Lock className="h-3.5 w-3.5" /> Used only to respond to this request. No marketing, no spam.
      </p>
    </div>
  )
}

/* ----------------------------------------------------------------- timing */
const timingOptions = [
  { value: 'asap', label: 'As soon as possible', hint: "We'll reach out to find the earliest time", icon: Zap },
  { value: 'date', label: 'Pick a preferred date', hint: 'Choose a day and time of day', icon: CalendarDays },
  { value: 'flexible', label: "I'm flexible", hint: 'Any time that works for the team', icon: Shuffle },
]

export function TimingStep({
  timing,
  set,
  onModePicked,
  errors,
}: {
  timing: Draft['timing']
  set: (patch: Partial<Draft['timing']>) => void
  onModePicked: (mode: string) => void
  errors: Errors
}) {
  return (
    <div className="grid gap-8">
      <div>
        <ChoiceCards
          label="Preferred timing"
          options={timingOptions}
          selected={timing.mode ? [timing.mode] : []}
          onToggle={(m) => {
            set({ mode: m as Draft['timing']['mode'] })
            onModePicked(m)
          }}
          cols={3}
        />
        <ErrorText>{errors.mode}</ErrorText>
      </div>

      {timing.mode === 'date' && (
        <div className="grid gap-8 md:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <div>
            <p className="mb-2.5 text-[14px] font-semibold text-white">Preferred date</p>
            <DatePicker value={timing.date} onChange={(date) => set({ date })} />
            <ErrorText>{errors.date}</ErrorText>
          </div>
          <div>
            <p className="mb-2.5 text-[14px] font-semibold text-white">Time of day</p>
            <div className="grid gap-2">
              {(['morning', 'afternoon', 'evening', 'any'] as TimeWindow[]).map((w) => {
                const on = timing.window === w
                return (
                  <button
                    key={w}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => set({ window: w })}
                    className={cn('lg flex h-14 items-center justify-between rounded-2xl px-5 text-left font-display text-[15px] font-semibold text-white', on && 'ring-2 ring-red')}
                    style={{ '--lg-tint': on ? 'rgba(229,35,41,0.16)' : 'rgba(255,255,255,0.045)' } as React.CSSProperties}
                  >
                    {windowLabels[w]}
                    <span className={cn('h-2.5 w-2.5 rounded-full', on ? 'bg-red' : 'bg-white/15')} />
                  </button>
                )
              })}
            </div>
            <ErrorText>{errors.window}</ErrorText>
          </div>
        </div>
      )}

      <p className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[14px] leading-relaxed text-white/65">
        <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-red" />
        These are your preferences, not a confirmed booking. The team will check availability and confirm a time with you.
      </p>
    </div>
  )
}

/* ----------------------------------------------------------------- review */
export function ReviewStep({ draft, onEdit }: { draft: Draft; onEdit: (stepKey: string) => void }) {
  const service = serviceById(draft.service)
  if (!service) return null
  const answers = draft.answers[service.id] ?? {}
  const rows = describeAnswers(service.id, answers)
  const photos = (answers.photos as string[] | undefined) ?? []
  const c = draft.contact
  const firstScreen = service.screens[0] ? `screen:${service.screens[0].id}` : 'service'

  return (
    <div className="grid gap-3">
      <ReviewBlock title="Service" onEdit={() => onEdit('service')}>
        <p className="flex items-center gap-2.5 font-display text-[17px] font-semibold text-white">
          <service.icon className="h-5 w-5 text-red" /> {service.name}
        </p>
      </ReviewBlock>

      <ReviewBlock title="Job details" onEdit={() => onEdit(firstScreen)}>
        {rows.length ? (
          <dl className="grid gap-2.5">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 text-[14.5px]">
                <dt className="text-white/50">{r.label}</dt>
                <dd className="text-white">{r.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-[14.5px] text-white/50">No extra details added.</p>
        )}
        {photos.length > 0 && (
          <ul className="mt-4 flex gap-2">
            {photos.map((p, i) => (
              <li key={i}>
                <img src={p} alt={`Photo ${i + 1}`} className="h-14 w-14 rounded-lg object-cover" />
              </li>
            ))}
          </ul>
        )}
      </ReviewBlock>

      <ReviewBlock title="Contact" onEdit={() => onEdit('contact')}>
        <dl className="grid gap-2.5 text-[14.5px]">
          {[
            ['Name', c.name],
            ['Phone', c.phone],
            ['ZIP', c.zip],
            ['Email', c.email || '—'],
            ['Reach me by', methodLabels[c.method]],
          ].map(([k, val]) => (
            <div key={k} className="grid grid-cols-[120px_minmax(0,1fr)] gap-4">
              <dt className="text-white/50">{k}</dt>
              <dd className="break-words text-white">{val}</dd>
            </div>
          ))}
        </dl>
      </ReviewBlock>

      <ReviewBlock title="Preferred time" onEdit={() => onEdit('timing')}>
        <p className="text-[15px] text-white">
          {draft.timing.mode ? describeTiming({ mode: draft.timing.mode, date: draft.timing.date, window: draft.timing.window ?? undefined }) : '—'}
        </p>
      </ReviewBlock>

      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-white/60">
        Need to speak with someone?
        <a href={business.phoneHref} className="inline-flex items-center gap-1.5 font-semibold text-white underline decoration-red decoration-2 underline-offset-4">
          <Phone className="h-3.5 w-3.5" /> Call {business.phoneDisplay}
        </a>
      </p>
    </div>
  )
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="lg rounded-[20px] p-5" style={{ '--lg-tint': 'rgba(255,255,255,0.04)' } as React.CSSProperties}>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="font-label text-[13px] font-semibold uppercase tracking-[0.18em] text-white/50">{title}</h2>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${title.toLowerCase()}`}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      </div>
      {children}
    </section>
  )
}
