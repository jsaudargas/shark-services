// DEMO LEAD INBOX: presenter-only page at /demo/leads (not linked from the
// customer navigation). Reads leads from this browser's localStorage.
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Download, FlaskConical, Inbox as InboxIcon, Mail, MessageSquare, Phone, RotateCcw, X } from 'lucide-react'
import { business } from '@/config/business'
import { serviceById, services } from '@/config/services'
import {
  describeAnswers,
  describeTiming,
  timingLines,
  loadLeads,
  methodLabels,
  resetLeads,
  saveLeads,
  statusLabels,
  type Lead,
  type LeadStatus,
} from '@/lib/leads'
import { shortDateTime } from '@/lib/format'
import { Link, requestHref } from '@/lib/router'
import { cn } from '@/lib/cn'
import { GlassButton, GlassLink } from '@/components/ui/Glass'
import { Wordmark } from '@/components/ui/Brand'

const statusTone: Record<LeadStatus, string> = {
  new: 'bg-red text-white',
  contacted: 'bg-amber-100 text-amber-900',
  scheduled: 'bg-emerald-100 text-emerald-900',
  closed: 'bg-paper-2 text-mute',
}

type Filter = 'all' | LeadStatus

export function InboxPage() {
  const [leads, setLeads] = useState<Lead[]>(() => loadLeads())
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Demo Lead Inbox | S.H.A.R.K. Services'
    // pick up leads submitted in another tab
    const onStorage = () => setLeads(loadLeads())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = (next: Lead[]) => {
    setLeads(next)
    saveLeads(next)
  }
  const setStatus = (id: string, status: LeadStatus) => update(leads.map((l) => (l.id === id ? { ...l, status } : l)))
  const reset = () => {
    resetLeads()
    setLeads(loadLeads())
    setOpenId(null)
  }

  const shown = useMemo(() => (filter === 'all' ? leads : leads.filter((l) => l.status === filter)), [leads, filter])
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: leads.length, new: 0, contacted: 0, scheduled: 0, closed: 0 }
    leads.forEach((l) => c[l.status]++)
    return c
  }, [leads])
  const open = leads.find((l) => l.id === openId) ?? null

  return (
    <div className="min-h-[100svh] bg-paper">
      <header className="border-b border-line bg-white">
        <div className="container-site flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Back to the website">
              <Wordmark tone="dark" />
            </Link>
            <span className="hidden h-6 w-px bg-line sm:block" />
            <span className="hidden items-center gap-2 font-display text-[15px] font-semibold sm:inline-flex">
              <InboxIcon className="h-4 w-4 text-red" /> Lead inbox
            </span>
            <span className="rounded-md bg-amber-100 px-2 py-0.5 font-label text-[12px] font-bold uppercase tracking-[0.14em] text-amber-900">Demo</span>
          </div>
          <div className="flex items-center gap-2">
            <GlassLink href="/" variant="light" size="sm">
              <ArrowLeft className="h-4 w-4" /> Website
            </GlassLink>
            <GlassLink href={requestHref()} variant="ink" size="sm">
              New test request
            </GlassLink>
          </div>
        </div>
      </header>

      <main className="container-site py-10">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[14px] leading-relaxed text-amber-950">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p>
            <b className="font-semibold">Demonstration only.</b> Requests are stored in this browser's local storage. They are not delivered to{' '}
            {business.name}, and other devices will not see them. A live version would send each request to an inbox, SMS alert or CRM. Records
            marked <b className="font-semibold">Sample data</b> are invented examples.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[32px] font-bold tracking-[-0.03em]">Service requests</h1>
            <p className="mt-1 text-[14.5px] text-mute">
              {counts.new} new · {counts.all} total
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <GlassButton variant="light" size="sm" onClick={() => exportCsv(leads)} disabled={!leads.length}>
              <Download className="h-4 w-4" /> Export CSV
            </GlassButton>
            <GlassButton variant="light" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Reset demo data
            </GlassButton>
          </div>
        </div>

        <div className="no-scrollbar mt-6 flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Filter by status">
          {(['all', 'new', 'contacted', 'scheduled', 'closed'] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors',
                filter === f ? 'bg-ink text-white' : 'text-mute hover:bg-white hover:text-ink',
              )}
            >
              {f === 'all' ? 'All' : statusLabels[f]} <span className="ml-1 opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto rounded-[20px] border border-line bg-white">
          {shown.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-20 text-center">
              <InboxIcon className="h-8 w-8 text-mute-2" />
              <p className="mt-4 font-display text-[17px] font-semibold">No requests here yet</p>
              <p className="mt-1 text-[14px] text-mute">Submit a test request through the website to see it arrive.</p>
              <GlassLink href={requestHref()} variant="ink" size="sm" className="mt-6">
                Open the request form
              </GlassLink>
            </div>
          ) : (
            <table className="w-full min-w-[860px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-line font-label text-[12.5px] uppercase tracking-[0.14em] text-mute">
                  <th className="px-5 py-3.5 font-semibold">Received</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Service</th>
                  <th className="px-5 py-3.5 font-semibold">ZIP</th>
                  <th className="px-5 py-3.5 font-semibold">Times that work</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((l) => {
                  const s = serviceById(l.service)
                  return (
                    <tr key={l.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                      <td className="whitespace-nowrap px-5 py-4 text-mute">{shortDateTime(l.createdAt)}</td>
                      <td className="px-5 py-4">
                        <button type="button" onClick={() => setOpenId(l.id)} className="text-left">
                          <span className="block font-semibold text-ink underline-offset-4 hover:underline">{l.contact.name}</span>
                          <span className="block text-[13px] text-mute">{l.contact.phone}</span>
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 font-medium">
                          {s && <s.icon className="h-4 w-4 text-red" />} {s?.name ?? l.service}
                        </span>
                        {l.sample && <SampleBadge />}
                      </td>
                      <td className="px-5 py-4 tabular-nums">{l.contact.zip}</td>
                      <td className="px-5 py-4">
                        {timingLines(l.timing).map((line) => (
                          <span key={line} className="block whitespace-nowrap">
                            {line}
                          </span>
                        ))}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className={cn('whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold', statusTone[l.status])}>{statusLabels[l.status]}</span>
                          <button type="button" onClick={() => setOpenId(l.id)} className="text-[13px] font-semibold text-ink/60 hover:text-ink">
                            Open
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        <p className="mt-4 text-[12.5px] text-mute">Services tracked: {services.length}. Leads are kept until you reset demo data or clear the browser.</p>
      </main>

      {open && <LeadDrawer lead={open} onClose={() => setOpenId(null)} onStatus={(st) => setStatus(open.id, st)} />}
    </div>
  )
}

function SampleBadge() {
  return <span className="ml-2 rounded bg-paper-2 px-1.5 py-0.5 font-label text-[11px] font-bold uppercase tracking-[0.12em] text-mute">Sample data</span>
}

function LeadDrawer({ lead, onClose, onStatus }: { lead: Lead; onClose: () => void; onStatus: (s: LeadStatus) => void }) {
  const s = serviceById(lead.service)
  const rows = describeAnswers(lead.service, lead.answers)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="lead-title">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" />
      <div className="relative flex h-full w-full max-w-[520px] flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-line p-6">
          <div>
            <p className="font-label text-[12.5px] font-semibold uppercase tracking-[0.16em] text-mute">
              {lead.id} {lead.sample && <SampleBadge />}
            </p>
            <h2 id="lead-title" className="mt-2 font-display text-[24px] font-bold tracking-[-0.02em]">
              {lead.contact.name}
            </h2>
            <p className="mt-1 text-[14px] text-mute">Received {shortDateTime(lead.createdAt)}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close details" autoFocus className="grid h-10 w-10 place-items-center rounded-full hover:bg-paper">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6">
          <div>
            <label htmlFor="lead-status" className="font-label text-[12.5px] font-semibold uppercase tracking-[0.16em] text-mute">
              Status
            </label>
            <select
              id="lead-status"
              value={lead.status}
              onChange={(e) => onStatus(e.target.value as LeadStatus)}
              className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-[14.5px] font-semibold"
            >
              {(Object.keys(statusLabels) as LeadStatus[]).map((k) => (
                <option key={k} value={k}>
                  {statusLabels[k]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <GlassLink href={`tel:${lead.contact.phone.replace(/\D/g, '')}`} variant="ink" size="sm">
              <Phone className="h-4 w-4" /> Call
            </GlassLink>
            <GlassLink href={`sms:${lead.contact.phone.replace(/\D/g, '')}`} variant="light" size="sm">
              <MessageSquare className="h-4 w-4" /> Text
            </GlassLink>
            {lead.contact.email && (
              <GlassLink href={`mailto:${lead.contact.email}`} variant="light" size="sm">
                <Mail className="h-4 w-4" /> Email
              </GlassLink>
            )}
          </div>

          <Block title="Contact">
            <Row k="Phone" v={lead.contact.phone} />
            <Row k="Email" v={lead.contact.email || '—'} />
            <Row k="ZIP" v={lead.contact.zip} />
            <Row k="Prefers" v={methodLabels[lead.contact.method]} />
            <Row k="Consent" v={lead.contact.consent ? 'Agreed to be contacted about this request' : 'No'} />
          </Block>

          <Block title={s?.name ?? 'Service'}>
            {rows.length ? rows.map((r) => <Row key={r.label} k={r.label} v={r.value} />) : <p className="text-[14px] text-mute">No details given.</p>}
          </Block>

          <Block title={lead.timing.mode === 'times' ? 'Times that work for the customer' : 'Preferred time'}>
            {timingLines(lead.timing).map((line, i) => (
              <Row key={line} k={lead.timing.mode === 'times' ? `Option ${i + 1}` : 'Preference'} v={line} />
            ))}
            <p className="text-[12.5px] text-mute">Nothing is booked. Pick one and confirm it with the customer.</p>
          </Block>

          {lead.photos.length > 0 && (
            <Block title={`Photos (${lead.photos.length})`}>
              <div className="grid grid-cols-3 gap-2">
                {lead.photos.map((p, i) => (
                  <img key={i} src={p} alt={`Customer photo ${i + 1}`} className="aspect-square w-full rounded-lg object-cover" />
                ))}
              </div>
            </Block>
          )}

          {lead.source.utm && (
            <Block title="Source">
              {Object.entries(lead.source.utm).map(([k, v]) => (
                <Row key={k} k={k} v={v} />
              ))}
            </Block>
          )}
        </div>
      </div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line p-5">
      <h3 className="mb-3 font-label text-[12.5px] font-semibold uppercase tracking-[0.16em] text-mute">{title}</h3>
      <div className="grid gap-2">{children}</div>
    </section>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 text-[14px]">
      <span className="text-mute">{k}</span>
      <span className="break-words font-medium text-ink">{v}</span>
    </div>
  )
}

function exportCsv(leads: Lead[]) {
  const head = ['id', 'received', 'status', 'sample', 'service', 'name', 'phone', 'email', 'zip', 'contact_method', 'preferred_time', 'details', 'photos']
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const lines = leads.map((l) =>
    [
      l.id,
      l.createdAt,
      statusLabels[l.status],
      l.sample ? 'yes' : 'no',
      serviceById(l.service)?.name ?? l.service,
      l.contact.name,
      l.contact.phone,
      l.contact.email ?? '',
      l.contact.zip,
      methodLabels[l.contact.method],
      describeTiming(l.timing),
      describeAnswers(l.service, l.answers)
        .map((r) => `${r.label}: ${r.value}`)
        .join('; '),
      String(l.photos.length),
    ]
      .map((v) => esc(String(v)))
      .join(','),
  )
  const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'shark-demo-leads.csv'
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
