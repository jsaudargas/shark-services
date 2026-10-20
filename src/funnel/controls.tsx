import { useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Check, CircleAlert, ImagePlus, Info, X } from 'lucide-react'
import type { Option } from '@/config/services'
import { cn } from '@/lib/cn'

const tint = (v: string) => ({ '--lg-tint': v }) as React.CSSProperties

export function ErrorText({ id, children }: { id?: string; children?: ReactNode }) {
  if (!children) return null
  return (
    <p id={id} role="alert" className="mt-2.5 flex items-center gap-1.5 text-[13.5px] font-medium text-[#FF6B6F]">
      <CircleAlert className="h-4 w-4 shrink-0" /> {children}
    </p>
  )
}

/* ------------------------------------------------------------ option cards */
export function ChoiceCards({
  options,
  selected,
  onToggle,
  multi,
  label,
  cols = 2,
}: {
  options: Option[]
  selected: string[]
  onToggle: (value: string) => void
  multi?: boolean
  label: string
  cols?: 2 | 3
}) {
  return (
    <div
      role={multi ? 'group' : 'radiogroup'}
      aria-label={label}
      className={cn('grid gap-2.5 sm:grid-cols-2', cols === 3 && 'lg:grid-cols-3')}
    >
      {options.map((o) => {
        const on = selected.includes(o.value)
        const Icon = o.icon
        return (
          <button
            key={o.value}
            type="button"
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={on}
            onClick={() => onToggle(o.value)}
            className={cn(
              'lg group flex min-h-[76px] items-center gap-4 rounded-[18px] px-4 py-3.5 text-left transition-transform duration-200 hover:-translate-y-0.5',
              on && 'ring-2 ring-red',
            )}
            style={tint(on ? 'rgba(229,35,41,0.16)' : 'rgba(255,255,255,0.045)')}
          >
            {Icon && (
              <span
                className={cn(
                  'grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors',
                  on ? 'bg-red text-white' : 'bg-white/[0.07] text-white/80 group-hover:text-white',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[15.5px] font-semibold tracking-[-0.01em] text-white">{o.label}</span>
              {o.hint && <span className="mt-0.5 block text-[13px] text-white/55">{o.hint}</span>}
            </span>
            <span
              className={cn(
                'grid h-6 w-6 shrink-0 place-items-center border transition-colors',
                multi ? 'rounded-md' : 'rounded-full',
                on ? 'border-red bg-red text-white' : 'border-white/25 text-transparent',
              )}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3.2} />
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------------------------------------------------- junk volume visual */
export function VolumeCards({ options, value, onPick, label }: { options: Option[]; value?: string; onPick: (v: string) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-2.5 sm:grid-cols-2">
      {options.map((o) => {
        const on = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onPick(o.value)}
            className={cn('lg flex flex-col gap-4 rounded-[18px] p-4 text-left transition-transform duration-200 hover:-translate-y-0.5', on && 'ring-2 ring-red')}
            style={tint(on ? 'rgba(229,35,41,0.16)' : 'rgba(255,255,255,0.045)')}
          >
            {/* truck-bed gauge */}
            <span className="relative flex h-9 overflow-hidden rounded-lg border border-white/[0.12] bg-white/[0.04]">
              {o.fill ? (
                <span className="h-full bg-red transition-[width] duration-500" style={{ width: `${o.fill}%`, opacity: on ? 1 : 0.55 }} />
              ) : (
                <span className="hatch h-full w-full" />
              )}
              <span className="absolute inset-0 flex">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="flex-1 border-r border-dashed border-white/15 last:border-0" />
                ))}
              </span>
            </span>
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-display text-[15.5px] font-semibold text-white">{o.label}</span>
              <span className="text-right text-[12.5px] text-white/55">{o.hint}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------- pills */
export function Pills({
  options,
  selected,
  onToggle,
  label,
  multi,
  size = 'lg',
}: {
  options: { value: string; label: string }[]
  selected: string[]
  onToggle: (v: string) => void
  label: string
  multi?: boolean
  size?: 'md' | 'lg'
}) {
  return (
    <div role={multi ? 'group' : 'radiogroup'} aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o.value)
        return (
          <button
            key={o.value}
            type="button"
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={on}
            onClick={() => onToggle(o.value)}
            className={cn(
              'lg-btn lg font-display',
              size === 'lg' ? 'h-14 px-6 text-[15px]' : 'h-11 px-5 text-[14px]',
              on ? 'lg-red text-white' : 'text-white/85',
            )}
            style={on ? undefined : tint('rgba(255,255,255,0.05)')}
          >
            {on && <Check className="h-4 w-4" strokeWidth={3} />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------- text field */
export function TextField({
  label,
  hint,
  error,
  optional,
  className,
  ...input
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode; error?: string; optional?: boolean }) {
  const id = useId()
  const errId = `${id}-err`
  const hintId = `${id}-hint`
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[14px] font-semibold text-white">
        {label} {optional && <span className="font-normal text-white/45">(optional)</span>}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={cn(error && errId, hint && hintId) || undefined}
        className={cn(
          'h-14 w-full rounded-2xl border bg-white/[0.05] px-4 text-[16px] text-white outline-none transition-colors placeholder:text-white/30',
          'focus:border-white/50 focus:bg-white/[0.08]',
          error ? 'border-[#FF6B6F]/80' : 'border-white/[0.12]',
        )}
        {...input}
      />
      {hint && !error && (
        <div id={hintId} className="mt-2 text-[13px] text-white/50">
          {hint}
        </div>
      )}
      <ErrorText id={errId}>{error}</ErrorText>
    </div>
  )
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  suggestions,
  error,
  optional,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  suggestions?: string[]
  error?: string
  optional?: boolean
}) {
  const id = useId()
  const add = (s: string) => onChange(value.trim() ? `${value.trim().replace(/[.]?$/, '.')} ${s}.` : `${s}.`)
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[14px] font-semibold text-white">
        {label} {optional && <span className="font-normal text-white/45">(optional)</span>}
      </label>
      <textarea
        id={id}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={cn(
          'w-full resize-y rounded-2xl border bg-white/[0.05] px-4 py-3.5 text-[16px] leading-relaxed text-white outline-none transition-colors placeholder:text-white/30',
          'focus:border-white/50 focus:bg-white/[0.08]',
          error ? 'border-[#FF6B6F]/80' : 'border-white/[0.12]',
        )}
      />
      {suggestions && suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] text-white/45">Quick add:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-white/[0.12] px-3 py-1.5 text-[12.5px] text-white/75 transition-colors hover:border-white/35 hover:text-white"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      <ErrorText id={`${id}-err`}>{error}</ErrorText>
    </div>
  )
}

/* ------------------------------------------------------------------ photos */
// Photos are downscaled in the browser for preview. In demo mode they are
// kept in this browser only and are never uploaded.
async function downscale(file: File, max = 560): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.72)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function PhotoField({ value, onChange, max = 6, label }: { value: string[]; onChange: (v: string[]) => void; max?: number; label: string }) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)

  const addFiles = async (files: FileList | File[]) => {
    setError('')
    const list = Array.from(files).filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name))
    const room = max - value.length
    if (room <= 0) return setError(`You can add up to ${max} photos.`)
    setBusy(true)
    const out: string[] = []
    let failed = 0
    for (const f of list.slice(0, room)) {
      if (f.size > 15 * 1024 * 1024) {
        failed++
        continue
      }
      try {
        out.push(await downscale(f))
      } catch {
        failed++
      }
    }
    setBusy(false)
    if (out.length) onChange([...value, ...out])
    if (failed) setError(`${failed} photo${failed > 1 ? 's' : ''} couldn't be read. Try JPG or PNG under 15 MB.`)
    else if (list.length > room) setError(`Only the first ${room} photo${room > 1 ? 's were' : ' was'} added (limit ${max}).`)
  }

  return (
    <div>
      <p className="mb-2 text-[14px] font-semibold text-white">{label}</p>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          void addFiles(e.dataTransfer.files)
        }}
        className={cn(
          'flex flex-col items-center rounded-[20px] border border-dashed px-6 py-8 text-center transition-colors',
          drag ? 'border-red bg-red/10' : 'border-white/20 bg-white/[0.03]',
        )}
      >
        <ImagePlus className="h-7 w-7 text-red" strokeWidth={1.7} />
        <p className="mt-3 font-display text-[15.5px] font-semibold text-white">Drop photos here or</p>
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy || value.length >= max}
          className="lg-btn lg mt-3 h-11 px-5 text-[13.5px] text-white"
          style={tint('rgba(255,255,255,0.08)')}
        >
          {busy ? 'Processing…' : value.length ? 'Add more photos' : 'Choose photos'}
        </button>
        <p className="mt-3 text-[12.5px] text-white/45">JPG, PNG or WEBP · up to {max} photos</p>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {value.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {value.map((src, i) => (
            <li key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10">
              <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-ink/80 text-white transition-colors hover:bg-red"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <ErrorText>{error}</ErrorText>
      <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-relaxed text-white/45">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" />
        Demo: photos are previewed and stored in this browser only. They are not uploaded to a server.
      </p>
    </div>
  )
}
