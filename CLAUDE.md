# Working rules

This site may be finished by a different person or Claude session than the one that started it.

1. **Read [HANDOFF.md](HANDOFF.md) first.** It holds the current status and what's left.
2. **After every edit, update HANDOFF.md:** add a dated entry at the top of the Log with
   what you did and what's left, and keep "Current status" and "What's left to finish" accurate.
3. Commit and push after each logical step so the GitHub repo always matches the latest state.
4. Never commit secrets: no `.env`, passwords, API tokens or `.site-password` files.
5. No invented content: no fake testimonials, review counts, client logos, prices, insurance,
   years in business, same-day or 24/7 claims. Use only what the client provided; mark anything
   missing as TBD in HANDOFF.md. Sample leads in the inbox must stay labelled SAMPLE DATA.
6. The funnel sends a **request**, not a booking. Never use "Confirm Booking" or promise a response
   time unless a real scheduling backend exists.
7. Content and questionnaires live in `src/config/`. Change copy and questions there, not in components.
8. Animate only transform and opacity. Liquid glass classes are in `src/index.css` (`.lg*`).
9. Run `npm run build` and `npm run lint` before pushing. Deploy with `npm run build:live` (emails the
   owner via `public/api/lead.php`). Never commit `public/api/config.php`.
10. Scheduling is availability only: customers offer times, nothing is booked. Don't add slot booking
    unless the client asks for a real calendar integration.
