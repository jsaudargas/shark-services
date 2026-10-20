import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { fromIsoDate, toIsoDate } from '@/lib/format'

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const HORIZON_DAYS = 90

/** Date picker for the customer's availability. Earliest choice is tomorrow:
 *  same-day service is not promised (use "As soon as possible" for urgent jobs).
 *  Days in `marked` already have a time of day chosen and show a dot. */
export function DatePicker({ value, onChange, marked = [] }: { value: string; onChange: (iso: string) => void; marked?: string[] }) {
  const { first, last } = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    const f = new Date(t)
    f.setDate(f.getDate() + 1)
    const l = new Date(t)
    l.setDate(l.getDate() + HORIZON_DAYS)
    return { first: f, last: l }
  }, [])

  const initial = value ? fromIsoDate(value) : first
  const [view, setView] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1))

  const days = useMemo(() => {
    const out: (Date | null)[] = Array(view.getDay()).fill(null)
    const n = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
    for (let d = 1; d <= n; d++) out.push(new Date(view.getFullYear(), view.getMonth(), d))
    return out
  }, [view])

  const canPrev = view > new Date(first.getFullYear(), first.getMonth(), 1)
  const canNext = new Date(view.getFullYear(), view.getMonth() + 1, 1) <= last
  const shift = (m: number) => setView(new Date(view.getFullYear(), view.getMonth() + m, 1))

  return (
    <div className="lg w-full max-w-[380px] rounded-[22px] p-4" style={{ '--lg-tint': 'rgba(255,255,255,0.045)' } as React.CSSProperties}>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" aria-label="Previous month" disabled={!canPrev} onClick={() => shift(-1)} className="grid h-10 w-10 place-items-center rounded-full text-white transition-colors hover:bg-white/10 disabled:opacity-25">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-display text-[15px] font-semibold text-white" aria-live="polite">
          {view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
        <button type="button" aria-label="Next month" disabled={!canNext} onClick={() => shift(1)} className="grid h-10 w-10 place-items-center rounded-full text-white transition-colors hover:bg-white/10 disabled:opacity-25">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center" role="group" aria-label="Choose a preferred date">
        {DOW.map((d) => (
          <span key={d} className="py-1.5 font-label text-[12px] font-semibold uppercase tracking-wider text-white/40">
            {d}
          </span>
        ))}
        {days.map((d, i) => {
          if (!d) return <span key={`e${i}`} />
          const iso = toIsoDate(d)
          const disabled = d < first || d > last
          const on = iso === value
          const hasTime = marked.includes(iso)
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              aria-pressed={on}
              aria-label={d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + (hasTime ? ', time added' : '')}
              onClick={() => onChange(iso)}
              className={cn(
                'relative aspect-square rounded-xl text-[14px] font-medium transition-colors',
                on ? 'bg-red font-semibold text-white' : 'text-white/85 hover:bg-white/10',
                disabled && 'cursor-not-allowed text-white/20 hover:bg-transparent',
              )}
            >
              {d.getDate()}
              {hasTime && <span className={cn('absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full', on ? 'bg-white' : 'bg-red')} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
