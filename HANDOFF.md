# Handoff log

Running log of the build. **Update this file after every edit** (newest entry on top):
what was done, and what is still left. Anyone (human or Claude) picking this up
should be able to continue from here without asking.

---

## Current status

- **Client:** S.H.A.R.K. Services, Long Island NY, (516) 244-8782, IG @s.h.a.r.kservices
- **Phase:** working sales demo, desktop-first. Funnel, homepage and demo inbox are built and tested end to end.
- **Repo:** https://github.com/jsaudargas/shark-services (renamed from `new-client-website`; old links redirect)
- **Next step:** show the demo to the owner, collect real photos and confirm the open facts below.

## What's left to finish

Confirm with the client (do not invent any of these):
- [ ] Real job photos to replace the Unsplash placeholders (truck, crew, before/after, each service)
- [ ] A logo file. The current wordmark + fin mark is a text interpretation
- [ ] Business email (none provided, so none is shown anywhere)
- [ ] Exact service area / towns (currently just "Long Island, NY"; ZIP check only gives a soft note outside 110/115/117-119)
- [ ] Hours, and whether any same-day or emergency service is offered (currently not claimed)
- [ ] Pricing to show, if any. The HVAC "$50 per unit" promo is NOT shown until confirmed (add a `pricing` field in `src/config/services.ts`)
- [ ] Insurance, licensing, years in business, reviews. None are claimed; add only with proof
- [ ] Legal entity name for the footer, and a privacy policy page before collecting real leads

Build work:
- [ ] Connect real lead delivery: set `VITE_LEAD_WEBHOOK_URL` (Zapier/Make/CRM) and add email/SMS alerts there
- [ ] Real photo upload (currently previews stay in the browser; webhook payload sends only the photo count)
- [ ] Mobile pass. Explicitly out of scope for this demo (per Justinas, 2026-10-20). Layout is responsive and has no horizontal scroll at 390px, but it has not been polished or tested on real phones
- [ ] Performance: JS is ~154 KB gzipped, mostly framer-motion (only used for funnel step transitions and could be replaced by CSS). No prerender yet (SPA), so add one before launch for SEO, per the Kodeborn SOP
- [ ] SEO/launch items from the SOP: robots.txt, sitemap, OG image, JSON-LD LocalBusiness, analytics (GA4), Search Console
- [ ] Deploy target and domain (Hostinger assumed; `public/.htaccess` already has the SPA fallback)

---

## Log

### 2026-10-20 · Demo build: homepage, booking funnel, demo inbox
**Done**
- Renamed the repo and folder to `shark-services`.
- Scaffolded Vite 8 + React 19 + TypeScript + Tailwind 3, the same stack as Kodeborn 5.0. Fonts: Montserrat (display), Inter (body), Barlow Condensed (labels), self-hosted via fontsource.
- **Liquid glass system** (`src/index.css`, `src/components/ui/Glass.tsx`): the 21st.dev designali technique (inset rim highlights + SVG displacement backdrop) rebuilt as `.lg` / `.lg-red` / `.lg-light` / `.lg-ink` classes. Used on the header, every button, the hero service picker, funnel option cards, the summary panel and the calendar.
- **Homepage**, laid out after the Roofex reference (photo hero with glass nav bar, small grey section tags, thin-bordered cards, FAQ accordion, dark photo band, light footer):
  hero with CTA, call button and 3 trust points; a glass quick-service picker inside the hero; a service-name marquee (instead of fake client logos); an 8-card services grid; a 3-step "How it works"; "Why S.H.A.R.K." values plus a photo band; FAQ; final CTA; footer; and a sticky mobile CTA bar.
- **Booking funnel** at `/request`, styled after the miles-of-junk quote wizard: one question per screen, auto-advance on single taps, a 4-stage progress bar, back without losing answers (both the button and browser back/forward), autosave to sessionStorage, inline validation, a live "Your request" side panel, photo upload with local previews, US phone formatting/validation, a soft out-of-area ZIP note, a contact-only consent checkbox, ASAP / date / flexible timing with a calendar and time of day, and a review screen with Edit links. Then "Send My Service Request" leads to a confirmation screen with the demo disclosure.
- All 8 questionnaires come from `src/config/services.ts`.
- **Demo lead inbox** at `/demo/leads`: localStorage records, 3 labelled SAMPLE DATA leads, status filter tabs, a detail drawer with status change, call/text/email links and photos, CSV export, and reset.
- Analytics abstraction: `funnel_started`, `service_selected`, `contact_step_viewed`, `service_request_submitted`, `call_clicked`. These only log to the console in dev.
- Tested in a headless browser at 1440px: the full Junk Removal journey from the hero CTA to the inbox, plus automated end-to-end runs for the other 7 services (with photo upload), validation errors, edit-from-review, back button, browser back/forward and reload. Console has 0 errors. `npm run build` and `oxlint` pass; oxlint shows 5 non-blocking warnings.
- Fixed during testing: an empty-field blur error was shifting the layout and swallowing the Continue click; the hero preload was firing on non-home routes; the step counter changed its total after the first screen.

**Left**
- See "What's left to finish" above.

**Image placeholders** (Unsplash photo ids, free Unsplash License):
hero `1619642751034-765dfdf7c58e` · junk `1781425009053-2baffa997d8c` · mechanic `1615906655593-ad0386982a0f` ·
small engine `1597691306652-3710b7663b93` · handyman `1513467535987-fd81bc7d62f8` · snow `1676903826883-cbbd7703f2f4` ·
dryer `1545173168-9f1947eebb7f` · hvac `1718203862467-c33159fdc504` · workbench band `1573998648748-fa6ef521cdf9` ·
tool wall band `1560801124-4a95dc193b94`

### 2026-10-20 · Repo setup
**Done**
- Created a public GitHub repo, local folder, README, HANDOFF, CLAUDE.md and .gitignore.
