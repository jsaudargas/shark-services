<?php
// Copy this file to config.php on the server (config.php is gitignored).
return [
    // Where new requests are emailed: the owner's inbox (any provider).
    'to' => 'owner@example.com',

    // Sender. Must be a mailbox on the SITE'S OWN DOMAIN (create one free in
    // Hostinger > Emails, e.g. website@sharkservices.com), or mail lands in spam.
    'from' => 'website@example.com',
    'from_name' => 'S.H.A.R.K. Website',

    // 'mail' sends with PHP mail(). 'file' writes the email to outbox/ instead
    // (local testing only).
    'transport' => 'mail',

    // Optional: append every lead as one JSON line OUTSIDE public_html, as a
    // backup if an email ever fails. Example for Hostinger:
    // 'backup_file' => dirname(__DIR__, 2) . '/shark-leads.jsonl',
    'backup_file' => null,
];
