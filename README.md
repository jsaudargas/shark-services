# S.H.A.R.K. Services: lead-generation website demo

Sales demo built by Kodeborn for **S.H.A.R.K. Services**, a multi-service residential and commercial
company on Long Island, NY (junk removal, mechanic, small engine, handyman, snow & leaf, dryer vents,
HVAC cleaning). The site is built around one thing: a fast, service-specific **request-an-estimate
funnel** that turns Instagram visitors into qualified leads.

- **Status, what's done, what's left:** [HANDOFF.md](HANDOFF.md)
- **Rules for whoever continues:** [CLAUDE.md](CLAUDE.md)

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type check + production build into dist/
npm run lint       # oxlint
```

## Routes

| Route | What it is |
|---|---|
| `/` | Homepage: hero with quick service picker, services grid, how it works, why us, FAQ, final CTA |
| `/request` | The booking funnel. `/request?service=junk` (or any service id) skips straight to that questionnaire |
| `/demo/leads` | **Demo lead inbox** for the presenter. Not linked from the customer nav (linked from the confirmation screen in demo mode) |
| anything else | 404 page |

Service ids: `junk`, `mechanic`, `small-engine`, `handyman`, `snow-leaf`, `dryer-vent`, `hvac`, `other`.

## Where things live

| File | Purpose |
|---|---|
| `src/config/business.ts` | Phone, Instagram, area, demo-mode flag. Only verified client facts go here |
| `src/config/services.ts` | Every service **and its whole questionnaire**. The funnel, review screen and inbox all render from this |
| `src/funnel/model.ts` | Funnel state, step list, validation, session autosave |
| `src/funnel/controls.tsx` | Option cards, pills, volume gauge, text fields, photo upload |
| `src/funnel/steps.tsx` | Service / questions / contact / timing / review screens |
| `src/pages/Request.tsx` | Funnel page: progress, navigation, browser back support, summary panel, confirmation |
| `src/lib/leads.ts` | Lead type, `submitLead()` adapter (demo localStorage or real webhook), sample data |
| `src/lib/analytics.ts` | `track()` events, local-only until `VITE_ANALYTICS=on` |
| `src/components/ui/Glass.tsx` + `src/index.css` | Liquid glass system (`.lg`, `.lg-red`, `.lg-light`, `.lg-ink`) and SVG displacement filters |

## Demo vs production

- **Demo (default):** submissions are saved to this browser's `localStorage` and shown in `/demo/leads`.
  Nothing is sent to the business. The confirmation screen says so.
- **Production:** set `VITE_LEAD_WEBHOOK_URL` (Zapier / Make / n8n / CRM endpoint) at build time.
  `submitLead()` POSTs the lead JSON there, the demo notices disappear, and email/SMS alerts or calendar
  sync are configured on that endpoint.

## Liquid glass

Based on the technique of the [21st.dev liquid glass button](https://21st.dev/@designali-in/components/liquid-glass-button)
(stacked inset rim highlights + SVG displacement backdrop filter), reimplemented as CSS classes so it
works on buttons, headers, cards and panels. Chromium gets the displacement filter; Safari/Firefox get
the same rim with a plain backdrop blur (`html.lg-svg` is set in `main.tsx`).

## Images

Placeholder photos from Unsplash (free Unsplash License), saved as WebP in `public/images/`. Replace
with the client's real job photos before launch. See HANDOFF.md for the list.
