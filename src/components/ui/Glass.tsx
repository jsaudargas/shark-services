// Liquid glass primitives. Visual rules live in index.css (.lg*); this file
// holds the SVG displacement filters and the button component.
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Link } from '@/lib/router'

/** Mount once at the app root. Hidden SVG filters referenced by .lg::before. */
export function GlassFilters() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter id="lg-distort" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="3" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="softNoise" />
          <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="60" xChannelSelector="R" yChannelSelector="B" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="4" />
        </filter>
        <filter id="lg-distort-soft" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="1" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="3" result="softNoise" />
          <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="34" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="10" />
        </filter>
      </defs>
    </svg>
  )
}

/** Chromium is the only engine that renders url() inside backdrop-filter. */
export function detectGlassSupport() {
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands
  const chromium = brands ? brands.some((b) => b.brand === 'Chromium') : /Chrome\/\d+/.test(navigator.userAgent) && !/Firefox/.test(navigator.userAgent)
  if (chromium) document.documentElement.classList.add('lg-svg')
}

type Variant = 'red' | 'clear' | 'light' | 'ink'
type Size = 'sm' | 'md' | 'lg'

const variantClass: Record<Variant, string> = {
  red: 'lg lg-red text-white',
  clear: 'lg text-white',
  light: 'lg lg-light text-ink',
  ink: 'lg lg-ink text-white',
}

const sizeClass: Record<Size, string> = {
  sm: 'h-10 px-4 text-[13px]',
  md: 'h-12 px-6 text-[14px]',
  lg: 'h-14 px-7 text-[15px]',
}

interface Common {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export const GlassButton = forwardRef<HTMLButtonElement, Common & ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ variant = 'clear', size = 'md', className, children, type = 'button', ...rest }, ref) => (
    <button ref={ref} type={type} className={cn('lg-btn', variantClass[variant], sizeClass[size], className)} {...rest}>
      {children}
    </button>
  ),
)
GlassButton.displayName = 'GlassButton'

export function GlassLink({
  variant = 'clear',
  size = 'md',
  className,
  children,
  href,
  ...rest
}: Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const cls = cn('lg-btn', variantClass[variant], sizeClass[size], className)
  if (href.startsWith('/'))
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    )
  return (
    <a href={href} className={cls} {...rest}>
      {children}
    </a>
  )
}
