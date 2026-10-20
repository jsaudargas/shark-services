# Lead email (`lead.php`)

Every request from the website is emailed to the owner by `lead.php`, a single PHP file that runs on the
same Hostinger hosting as the site. It uses the server's built-in `mail()`, so there is no Zapier, EmailJS
or other third-party service, no API key and no per-message cost.

The email contains the service, every answer, **all the times the customer said work for them** (nothing
is booked), contact details with Call / Text / Email buttons, and the customer's photos as attachments.
Reply-To is set to the customer's email when they gave one.

## Go live (about 5 minutes in hPanel)

1. **Create a sender mailbox on the site's domain**, e.g. `website@<domain>` (Hostinger > Emails; included
   with hosting). Sending "from" a Gmail address would land in spam.
2. **Create `public_html/api/config.php`** from `config.example.php`: set `to` (owner's inbox) and `from`
   (the mailbox from step 1). Optionally set `backup_file` to keep a copy of every lead outside `public_html`.
3. **Build the site in live mode:** `VITE_LEAD_ENDPOINT=/api/lead.php npm run build`, then deploy `dist/`
   (it already contains `api/lead.php` and `api/.htaccess`).
   Add `VITE_DEMO_INBOX=on` too if you also want the browser-local demo inbox to keep a copy during demos.
4. **Send one test request** from the live site and check the inbox *and* the spam folder. If it lands in
   spam, add the SPF/DKIM records Hostinger shows under Emails > DNS settings.

## Protection built in

Server-side validation (name, US phone, ZIP, consent), a hidden spam-trap field, 6 requests per IP per
10 minutes, a 6 MB request cap, image checks on attachments, no customer input in mail headers apart from
a validated Reply-To, and `.htaccess` blocks direct access to `config.php`.

## Local test

There's no PHP dev server in this project. `lead.php` was tested with php-wasm (PHP 8.3) and
`'transport' => 'file'`, which writes `outbox/<id>.eml` and `outbox/<id>.html` instead of sending.
