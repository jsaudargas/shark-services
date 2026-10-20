import { cn } from '@/lib/cn'

/** Geometric dorsal fin: the brand mark. */
export function Fin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M2 21c4.8-.7 8.8-5 10.6-18 2.4 7.2 5.7 13.6 9.4 18z" fill="currentColor" />
    </svg>
  )
}

/** Text wordmark: S.H.A.R.K. with red stops, "SERVICES" underneath. */
export function Wordmark({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Fin className="h-6 w-6 shrink-0 text-red" />
      <span className="flex flex-col leading-none">
        <span className={cn('font-display text-[19px] font-extrabold tracking-[-0.02em]', tone === 'light' ? 'text-white' : 'text-ink')}>
          S<i className="not-italic text-red">.</i>H<i className="not-italic text-red">.</i>A<i className="not-italic text-red">.</i>R
          <i className="not-italic text-red">.</i>K<i className="not-italic text-red">.</i>
        </span>
        <span className={cn('mt-0.5 font-label text-[10.5px] font-semibold uppercase tracking-[0.42em]', tone === 'light' ? 'text-fg-mute' : 'text-mute')}>
          Services
        </span>
      </span>
    </span>
  )
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}
