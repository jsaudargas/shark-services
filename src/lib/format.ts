export const digits = (s: string) => s.replace(/\D/g, '')

/** "5162448782" -> "(516) 244-8782" while typing; tolerates a leading 1 */
export function formatUsPhone(input: string) {
  let d = digits(input)
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1)
  d = d.slice(0, 10)
  if (d.length < 4) return d.length ? `(${d}` : ''
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

/** NANP: 10 digits, area code and exchange cannot start with 0 or 1 */
export function isValidUsPhone(input: string) {
  let d = digits(input)
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1)
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(d)
}

export const isValidZip = (z: string) => /^\d{5}$/.test(z)

/** Long Island (Nassau + Suffolk) ZIPs are 110xx, 115xx and 117xx-119xx.
 *  Used only for a soft "outside our usual area?" note, never to block. */
export const looksLikeLongIsland = (z: string) => /^(110|115|117|118|119)\d{2}$/.test(z)

export const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim())

export function toIsoDate(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function fromIsoDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const longDate = (iso: string) =>
  fromIsoDate(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

export const shortDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? ''
