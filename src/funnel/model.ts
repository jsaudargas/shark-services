// Funnel state, step list and validation. UI lives in ./steps and ../pages/Request.
import { serviceById, type Field, type Screen, type ServiceId } from '@/config/services'
import { normalizeTiming, type Availability, type AnswerValue, type ContactMethod, type TimingMode } from '@/lib/leads'
import { isValidEmail, isValidUsPhone, isValidZip } from '@/lib/format'

export interface Draft {
  service: ServiceId | null
  /** answers are kept per service so switching services and back loses nothing */
  answers: Partial<Record<ServiceId, Record<string, AnswerValue>>>
  contact: { name: string; phone: string; zip: string; email: string; method: ContactMethod; consent: boolean }
  /** times the customer says work for them; no booking slots are reserved */
  timing: { mode: TimingMode | null; slots: Availability[] }
}

export const emptyDraft = (): Draft => ({
  service: null,
  answers: {},
  contact: { name: '', phone: '', zip: '', email: '', method: 'text', consent: false },
  timing: { mode: null, slots: [] },
})

export type Stage = 0 | 1 | 2 | 3
export const stageLabels = ['Service', 'Job details', 'Contact', 'Time & review'] as const

export type Step =
  | { kind: 'service'; key: 'service'; stage: 0 }
  | { kind: 'screen'; key: string; stage: 1; screen: Screen }
  | { kind: 'contact'; key: 'contact'; stage: 2 }
  | { kind: 'timing'; key: 'timing'; stage: 3 }
  | { kind: 'review'; key: 'review'; stage: 3 }

export function buildSteps(service: ServiceId | null): Step[] {
  const s = serviceById(service)
  const screens: Step[] = (s?.screens ?? []).map((screen) => ({ kind: 'screen', key: `screen:${screen.id}`, stage: 1, screen }))
  return [
    { kind: 'service', key: 'service', stage: 0 },
    ...screens,
    { kind: 'contact', key: 'contact', stage: 2 },
    { kind: 'timing', key: 'timing', stage: 3 },
    { kind: 'review', key: 'review', stage: 3 },
  ]
}

export type Errors = Record<string, string>

const isEmpty = (v: AnswerValue | undefined) => v == null || (Array.isArray(v) ? v.length === 0 : v.trim() === '')

export function validateField(field: Field, answers: Record<string, AnswerValue>): string | null {
  const v = answers[field.id]
  if (field.type === 'photos') return null
  if (field.required && isEmpty(v)) {
    if (field.type === 'single') return 'Choose an option to continue.'
    if (field.type === 'multi') return 'Pick at least one option.'
    return `${field.label} is required.`
  }
  if ((field.type === 'single' || field.type === 'multi') && field.otherValue) {
    const picked = Array.isArray(v) ? v.includes(field.otherValue) : v === field.otherValue
    const other = answers[`${field.id}__other`]
    if (picked && (typeof other !== 'string' || other.trim().length < 2)) return 'Tell us a little more about "something else".'
  }
  if (field.type === 'textarea' && field.minLength && typeof v === 'string' && v.trim() && v.trim().length < field.minLength) {
    return 'Add a few more words so the team understands the job.'
  }
  if (field.id === 'year' && typeof v === 'string' && v.trim()) {
    const y = Number(v)
    const max = new Date().getFullYear() + 1
    if (!/^\d{4}$/.test(v.trim()) || y < 1950 || y > max) return `Enter a 4-digit year between 1950 and ${max}.`
  }
  return null
}

export function validateStep(step: Step, draft: Draft): Errors {
  const errors: Errors = {}
  if (step.kind === 'service') {
    if (!draft.service) errors.service = 'Choose a service to continue.'
  } else if (step.kind === 'screen') {
    const answers = (draft.service && draft.answers[draft.service]) || {}
    for (const f of step.screen.fields) {
      const e = validateField(f, answers)
      if (e) errors[f.id] = e
    }
  } else if (step.kind === 'contact') {
    const c = draft.contact
    if (c.name.trim().length < 2) errors.name = 'Enter your name.'
    if (!c.phone.trim()) errors.phone = 'Enter a phone number so we can reach you.'
    else if (!isValidUsPhone(c.phone)) errors.phone = 'Enter a valid 10-digit US phone number.'
    if (!isValidZip(c.zip)) errors.zip = 'Enter your 5-digit ZIP code.'
    if (c.email.trim() && !isValidEmail(c.email)) errors.email = 'That email address looks incomplete.'
    if (c.method === 'email' && !c.email.trim()) errors.email = 'Add your email, or choose call or text instead.'
    if (!c.consent) errors.consent = 'Please agree so the team can contact you about this request.'
  } else if (step.kind === 'timing') {
    const t = draft.timing
    if (!t.mode) errors.mode = 'Choose when you would like us to come by.'
    if (t.mode === 'times' && t.slots.length === 0) errors.slots = 'Pick at least one day and time of day that works for you.'
  }
  return errors
}

/** A screen auto-advances when its only decision is a single tap. */
export function autoAdvances(step: Step) {
  if (step.kind === 'service') return true
  if (step.kind !== 'screen') return false
  return step.screen.fields.length === 1 && step.screen.fields[0].type === 'single'
}

// ---- session persistence (this tab only; nothing is sent anywhere) --------
const DRAFT_KEY = 'shark-request-draft'

export function loadDraft(): { draft: Draft; stepKey: string | null } | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { draft: Draft; stepKey: string | null }
    const draft = { ...emptyDraft(), ...parsed.draft }
    // drafts saved before multi-time support had { mode: 'date', date, window }
    draft.timing = parsed.draft.timing?.mode ? normalizeTiming(parsed.draft.timing) : emptyDraft().timing
    return { draft, stepKey: parsed.stepKey }
  } catch {
    return null
  }
}

export function saveDraft(draft: Draft, stepKey: string) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, stepKey }))
    return true
  } catch {
    return false
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    /* ignore */
  }
}
