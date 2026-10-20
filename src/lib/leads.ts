// Lead model + delivery adapter.
//
// DEMO (default): leads are written to this browser's localStorage so the demo
// inbox can show them. That is NOT a lead delivery system.
// LIVE: set VITE_LEAD_ENDPOINT=/api/lead.php at build time. The lead is POSTed
// to public/api/lead.php on the same Hostinger site, which emails the owner
// (PHP mail(), no third-party service, no credits). See public/api/README.md.

import { DEMO_MODE, leadEndpoint, mirrorToDemoInbox } from '@/config/business'
import { serviceById, type ServiceId } from '@/config/services'

export type AnswerValue = string | string[]
export type ContactMethod = 'call' | 'text' | 'email'
export type TimingMode = 'asap' | 'times' | 'flexible'
export type TimeWindow = 'morning' | 'afternoon' | 'evening' | 'any'
export type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'closed'

export interface LeadContact {
  name: string
  phone: string
  zip: string
  email?: string
  method: ContactMethod
  consent: boolean
}

/** A day + time of day the customer says works for them. Not a booked slot. */
export interface Availability {
  date: string // yyyy-mm-dd
  window: TimeWindow
}

export interface LeadTiming {
  mode: TimingMode
  /** only for mode 'times': every option the customer offered, in date order */
  slots: Availability[]
}

export const MAX_SLOTS = 5

export interface Lead {
  id: string
  createdAt: string
  status: LeadStatus
  sample?: boolean
  service: ServiceId
  answers: Record<string, AnswerValue>
  contact: LeadContact
  timing: LeadTiming
  /** downscaled JPEG data URLs; demo only, kept in this browser */
  photos: string[]
  source: { page: string; utm?: Record<string, string> }
}

export const statusLabels: Record<LeadStatus, string> = {
  new: 'New Request',
  contacted: 'Contacted',
  scheduled: 'Scheduled',
  closed: 'Closed',
}

export const methodLabels: Record<ContactMethod, string> = { call: 'Call', text: 'Text', email: 'Email' }

export const windowLabels: Record<TimeWindow, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  any: 'Any time',
}

const STORE_KEY = 'shark-demo-leads'

export function newLeadId() {
  const n = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `SHK-${n}`
}

export function loadLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return (JSON.parse(raw) as Lead[]).map((l) => ({ ...l, timing: normalizeTiming(l.timing) }))
  } catch {
    /* storage blocked or corrupt: fall through to samples */
  }
  return sampleLeads()
}

export function saveLeads(leads: Lead[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(leads))
    return true
  } catch {
    return false
  }
}

export function resetLeads() {
  try {
    localStorage.removeItem(STORE_KEY)
  } catch {
    /* ignore */
  }
}

export interface SubmitResult {
  ok: boolean
  delivered: boolean // true only when the server accepted the lead
  error?: string
}

/** What the server needs to write the owner's email: readable rows, not ids. */
function emailPayload(lead: Lead, honeypot: string) {
  return {
    id: lead.id,
    createdAt: lead.createdAt,
    service: serviceById(lead.service)?.name ?? lead.service,
    details: describeAnswers(lead.service, lead.answers),
    contact: { ...lead.contact, method: methodLabels[lead.contact.method] },
    timing: timingLines(lead.timing),
    photos: lead.photos,
    source: lead.source,
    website: honeypot, // spam trap: real visitors never fill this
  }
}

function storeLocally(lead: Lead) {
  const saved = saveLeads([lead, ...loadLeads()])
  // storage quota: retry without photos rather than losing the lead
  if (!saved && lead.photos.length) saveLeads([{ ...lead, photos: [] }, ...loadLeads()])
}

export async function submitLead(lead: Lead, honeypot = ''): Promise<SubmitResult> {
  if (!DEMO_MODE && leadEndpoint) {
    try {
      const res = await fetch(leadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload(lead, honeypot)),
      })
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !body.ok) return { ok: false, delivered: false, error: body.error ?? `Server responded ${res.status}` }
      if (mirrorToDemoInbox) storeLocally(lead)
      return { ok: true, delivered: true }
    } catch {
      return { ok: false, delivered: false, error: 'Network error' }
    }
  }
  // demo: short pause so the sending state is visible, then store locally
  await new Promise((r) => setTimeout(r, 900))
  storeLocally(lead)
  return { ok: true, delivered: false }
}

/** Human-readable answers for review screens and the inbox, in config order. */
export function describeAnswers(serviceId: ServiceId, answers: Record<string, AnswerValue>) {
  const service = serviceById(serviceId)
  const rows: { label: string; value: string }[] = []
  if (!service) return rows
  for (const screen of service.screens) {
    for (const field of screen.fields) {
      if (field.type === 'photos') continue
      const raw = answers[field.id]
      if (raw == null || raw === '' || (Array.isArray(raw) && raw.length === 0)) continue
      let value: string
      if (field.type === 'single' || field.type === 'multi') {
        const values = Array.isArray(raw) ? raw : [raw]
        value = values
          .map((v) => {
            if (field.otherValue && v === field.otherValue) {
              const other = answers[`${field.id}__other`]
              return typeof other === 'string' && other.trim() ? other.trim() : 'Something else'
            }
            return field.options.find((o) => o.value === v)?.label ?? v
          })
          .join(', ')
      } else {
        value = Array.isArray(raw) ? raw.join(', ') : raw
      }
      rows.push({ label: field.summaryLabel ?? field.label, value })
    }
  }
  return rows
}

export function slotLabel(slot: Availability) {
  const d = new Date(slot.date + 'T12:00:00')
  const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return `${day} · ${windowLabels[slot.window]}`
}

/** One line per option, for the review screen, inbox and email. */
export function timingLines(t: { mode: TimingMode | null; slots: Availability[] }): string[] {
  if (t.mode === 'asap') return ['As soon as possible']
  if (t.mode === 'flexible') return ["Flexible, any time that suits the team"]
  if (t.mode === 'times') return t.slots.length ? sortSlots(t.slots).map(slotLabel) : ['No times chosen']
  return []
}

export const describeTiming = (t: { mode: TimingMode | null; slots: Availability[] }) => timingLines(t).join(' / ') || '—'

export const sortSlots = (slots: Availability[]) => {
  const order: TimeWindow[] = ['morning', 'afternoon', 'evening', 'any']
  return [...slots].sort((a, b) => a.date.localeCompare(b.date) || order.indexOf(a.window) - order.indexOf(b.window))
}

/** Leads saved before multi-time support stored a single date + window. */
export function normalizeTiming(t: unknown): LeadTiming {
  const x = (t ?? {}) as { mode?: string; slots?: Availability[]; date?: string; window?: TimeWindow }
  if (x.mode === 'date') return { mode: 'times', slots: x.date ? [{ date: x.date, window: x.window ?? 'any' }] : [] }
  const mode: TimingMode = x.mode === 'asap' || x.mode === 'flexible' || x.mode === 'times' ? x.mode : 'flexible'
  return { mode, slots: Array.isArray(x.slots) ? x.slots : [] }
}

// ---------------------------------------------------------------------------
// SAMPLE DATA: invented records, flagged `sample: true` and badged in the UI.
// They exist only so the inbox is not empty before the first demo run.
// ---------------------------------------------------------------------------
function sampleLeads(): Lead[] {
  const now = Date.now()
  const ago = (h: number) => new Date(now - h * 3600_000).toISOString()
  const inDays = (d: number) => {
    const x = new Date(now + d * 86400_000)
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
  }
  const base = { photos: [], source: { page: '/request' } }
  return [
    {
      ...base,
      id: 'SHK-SAMPLE1',
      sample: true,
      createdAt: ago(3),
      status: 'new',
      service: 'junk',
      answers: { items: ['furniture', 'appliances'], amount: 'several', location: 'basement' },
      contact: { name: 'Sample Customer A', phone: '(555) 010-0101', zip: '11735', method: 'text', consent: true },
      timing: { mode: 'times', slots: [{ date: inDays(3), window: 'morning' }, { date: inDays(4), window: 'evening' }] },
    },
    {
      ...base,
      id: 'SHK-SAMPLE2',
      sample: true,
      createdAt: ago(20),
      status: 'contacted',
      service: 'mechanic',
      answers: { need: 'brakes', year: '2017', make: 'Honda', model: 'Accord', issue: 'Squeaking when I brake' },
      contact: { name: 'Sample Customer B', phone: '(555) 010-0102', zip: '11550', email: 'sample.b@example.com', method: 'call', consent: true },
      timing: { mode: 'asap', slots: [] },
    },
    {
      ...base,
      id: 'SHK-SAMPLE3',
      sample: true,
      createdAt: ago(46),
      status: 'scheduled',
      service: 'snow-leaf',
      answers: { work: ['leaves', 'hauling'], property: 'residential', area: 'yard' },
      contact: { name: 'Sample Customer C', phone: '(555) 010-0103', zip: '11779', method: 'text', consent: true },
      timing: { mode: 'flexible', slots: [] },
    },
  ]
}
