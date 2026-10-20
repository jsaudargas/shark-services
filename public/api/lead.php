<?php
/**
 * S.H.A.R.K. Services: service-request mailer.
 *
 * Receives the funnel's JSON POST and emails it to the owner with PHP mail().
 * Runs on the same Hostinger hosting as the site: no third-party service, no
 * API keys, no per-message credits. Settings live in config.php next to this
 * file (copy config.example.php; config.php is gitignored).
 *
 * Response: {"ok":true,"id":"SHK-XXXXXX"} or {"ok":false,"error":"..."}.
 */

declare(strict_types=1);

date_default_timezone_set('America/New_York'); // the business is on Long Island

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) respond(500, ['ok' => false, 'error' => 'not_configured']);
$cfg = require $configFile;
$to = (string)($cfg['to'] ?? '');
$from = (string)($cfg['from'] ?? '');
if (!filter_var($to, FILTER_VALIDATE_EMAIL) || !filter_var($from, FILTER_VALIDATE_EMAIL)) respond(500, ['ok' => false, 'error' => 'not_configured']);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond(405, ['ok' => false, 'error' => 'method_not_allowed']);

$raw = file_get_contents('php://input', false, null, 0, 6_000_001);
if ($raw === false || strlen($raw) > 6_000_000) respond(413, ['ok' => false, 'error' => 'too_large']);
$d = json_decode($raw, true);
if (!is_array($d)) respond(400, ['ok' => false, 'error' => 'bad_json']);

// spam trap: humans never see the "website" field
if (!empty($d['website'])) respond(200, ['ok' => true, 'id' => 'SHK-000000']);

// ---- rate limit: 6 requests per IP per 10 minutes ----------------------------
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rlFile = sys_get_temp_dir() . '/shark-rl-' . md5($ip) . '.json';
$now = time();
$hits = is_file($rlFile) ? array_filter((array)json_decode((string)file_get_contents($rlFile), true), fn($t) => is_int($t) && $t > $now - 600) : [];
if (count($hits) >= 6) respond(429, ['ok' => false, 'error' => 'too_many_requests']);
$hits[] = $now;
@file_put_contents($rlFile, json_encode(array_values($hits)));

// ---- validation ---------------------------------------------------------------
/** single-line text: no control characters, trimmed, capped */
function line($v, int $max): string
{
    $s = is_string($v) ? $v : '';
    $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $s) ?? '';
    return mb_substr(trim($s), 0, $max);
}
/** multi-line text: keeps line breaks */
function text($v, int $max): string
{
    $s = is_string($v) ? str_replace("\r\n", "\n", $v) : '';
    $s = preg_replace('/[\x00-\x09\x0B-\x1F\x7F]+/u', ' ', $s) ?? '';
    return mb_substr(trim($s), 0, $max);
}

$c = is_array($d['contact'] ?? null) ? $d['contact'] : [];
$name = line($c['name'] ?? '', 100);
$phone = line($c['phone'] ?? '', 30);
$zip = line($c['zip'] ?? '', 10);
$email = line($c['email'] ?? '', 160);
$method = line($c['method'] ?? '', 20);
$consent = ($c['consent'] ?? false) === true;
$service = line($d['service'] ?? '', 80);
$id = preg_match('/^SHK-[A-Z0-9]{6}$/', (string)($d['id'] ?? '')) ? (string)$d['id'] : 'SHK-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));

$digits = preg_replace('/\D/', '', $phone) ?? '';
if (strlen($digits) === 11 && $digits[0] === '1') $digits = substr($digits, 1);
$errors = [];
if (mb_strlen($name) < 2) $errors[] = 'name';
if (!preg_match('/^[2-9]\d{2}[2-9]\d{6}$/', $digits)) $errors[] = 'phone';
if (!preg_match('/^\d{5}$/', $zip)) $errors[] = 'zip';
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if ($service === '') $errors[] = 'service';
if (!$consent) $errors[] = 'consent';
if ($errors) respond(422, ['ok' => false, 'error' => 'invalid', 'fields' => $errors]);

$details = [];
foreach (array_slice(is_array($d['details'] ?? null) ? $d['details'] : [], 0, 30) as $row) {
    if (!is_array($row)) continue;
    $label = line($row['label'] ?? '', 60);
    $value = text($row['value'] ?? '', 2000);
    if ($label !== '' && $value !== '') $details[] = [$label, $value];
}
$timing = [];
foreach (array_slice(is_array($d['timing'] ?? null) ? $d['timing'] : [], 0, 6) as $t) {
    $t = line($t, 80);
    if ($t !== '') $timing[] = $t;
}

// photos: downscaled JPEG/PNG/WEBP data URLs from the browser, max 6, ~1.5 MB each
$photos = [];
foreach (array_slice(is_array($d['photos'] ?? null) ? $d['photos'] : [], 0, 6) as $i => $p) {
    if (!is_string($p) || !preg_match('#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$#', $p, $m)) continue;
    $bin = base64_decode($m[2], true);
    if ($bin === false || strlen($bin) > 1_500_000) continue;
    $info = @getimagesizefromstring($bin);
    if ($info === false) continue;
    $ext = $m[1] === 'jpeg' ? 'jpg' : $m[1];
    $photos[] = ['name' => sprintf('photo-%d.%s', $i + 1, $ext), 'type' => 'image/' . $m[1], 'data' => $bin];
}

// ---- compose -------------------------------------------------------------------
$h = fn(string $s): string => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$telHref = 'tel:+1' . $digits;
$smsHref = 'sms:+1' . $digits;
$prettyPhone = sprintf('(%s) %s-%s', substr($digits, 0, 3), substr($digits, 3, 3), substr($digits, 6));
$when = date('D, M j, Y g:i A', $now);

$rowsHtml = function (array $rows) use ($h): string {
    $out = '';
    foreach ($rows as [$k, $v]) {
        $out .= '<tr><td style="padding:7px 16px 7px 0;width:110px;color:#6b7178;font-size:14px;vertical-align:top;white-space:nowrap">' . $h($k) . '</td>'
            . '<td style="padding:7px 0;color:#0b0d10;font-size:14px;font-weight:600">' . nl2br($h($v)) . '</td></tr>';
    }
    return $out;
};
$section = fn(string $title, string $inner): string =>
    '<tr><td style="padding:22px 28px 0"><div style="font:600 12px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8a9097;margin-bottom:10px">'
    . $h($title) . '</div>' . $inner . '</td></tr>';

$contactRows = [['Name', $name], ['Phone', $prettyPhone], ['ZIP', $zip], ['Email', $email !== '' ? $email : '—'], ['Prefers', $method !== '' ? $method : '—']];
$timingHtml = '';
foreach ($timing as $t) $timingHtml .= '<div style="display:inline-block;margin:0 6px 6px 0;padding:8px 12px;border-radius:999px;background:#fdecec;color:#a3151a;font-size:14px;font-weight:600">' . $h($t) . '</div>';

$html = '<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#f2f2ef;font-family:Arial,Helvetica,sans-serif">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2ef;padding:24px 0"><tr><td align="center">'
    . '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden">'
    . '<tr><td style="background:#0b0d10;padding:22px 28px;color:#ffffff">'
    . '<div style="font:800 18px Arial,sans-serif;letter-spacing:-.01em">S<span style="color:#e52329">.</span>H<span style="color:#e52329">.</span>A<span style="color:#e52329">.</span>R<span style="color:#e52329">.</span>K<span style="color:#e52329">.</span> <span style="font-weight:600;color:#aab0b7;font-size:13px;letter-spacing:.2em">NEW REQUEST</span></div>'
    . '<div style="margin-top:14px;font:700 24px/1.2 Arial,sans-serif">' . $h($service) . '</div>'
    . '<div style="margin-top:6px;color:#aab0b7;font-size:14px">' . $h($name) . ' · ZIP ' . $h($zip) . ' · ' . $h($when) . '</div></td></tr>'
    . '<tr><td style="padding:22px 28px 0">'
    . '<a href="' . $h($telHref) . '" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border-radius:999px;background:#e52329;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px">Call ' . $h($prettyPhone) . '</a>'
    . '<a href="' . $h($smsHref) . '" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border-radius:999px;background:#0b0d10;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px">Text</a>'
    . ($email !== '' ? '<a href="mailto:' . $h($email) . '" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border-radius:999px;border:1px solid #d9d9d4;color:#0b0d10;text-decoration:none;font-weight:700;font-size:14px">Email</a>' : '')
    . '</td></tr>'
    . $section('Times that work for the customer', $timingHtml !== '' ? $timingHtml . '<div style="color:#6b7178;font-size:12.5px;margin-top:4px">Nothing is booked. Pick one and confirm it with the customer.</div>' : '<div style="font-size:14px">—</div>')
    . $section('Job details', '<table role="presentation" cellpadding="0" cellspacing="0">' . ($details ? $rowsHtml($details) : '<tr><td style="font-size:14px;color:#6b7178">No extra details.</td></tr>') . '</table>')
    . $section('Contact', '<table role="presentation" cellpadding="0" cellspacing="0">' . $rowsHtml($contactRows) . '</table>')
    . ($photos ? $section('Photos', '<div style="font-size:14px">' . count($photos) . ' attached to this email.</div>') : '')
    . '<tr><td style="padding:26px 28px 24px;color:#8a9097;font-size:12px;border-top:1px solid #eeeeea;margin-top:20px">Reference ' . $h($id)
    . ' · Sent from the website request form. The customer agreed to be contacted about this request.</td></tr>'
    . '</table></td></tr></table></body></html>';

$textLines = ["NEW REQUEST: $service", "$name · ZIP $zip · $when", '', 'TIMES THAT WORK FOR THE CUSTOMER'];
foreach ($timing as $t) $textLines[] = "- $t";
$textLines[] = '(Nothing is booked. Pick one and confirm it with the customer.)';
$textLines[] = '';
$textLines[] = 'JOB DETAILS';
foreach ($details as [$k, $v]) $textLines[] = "$k: $v";
$textLines[] = '';
$textLines[] = 'CONTACT';
foreach ($contactRows as [$k, $v]) $textLines[] = "$k: $v";
if ($photos) $textLines[] = "\n" . count($photos) . ' photo(s) attached.';
$textLines[] = "\nReference $id";
$textBody = implode("\n", $textLines);

$subject = "New request: $service - $name ($zip)";
$fromName = line($cfg['from_name'] ?? 'S.H.A.R.K. Website', 60);

$mixed = 'mix_' . bin2hex(random_bytes(12));
$alt = 'alt_' . bin2hex(random_bytes(12));
$headers = [
    'MIME-Version: 1.0',
    'From: ' . mb_encode_mimeheader($fromName, 'UTF-8') . " <$from>",
    'Content-Type: multipart/mixed; boundary="' . $mixed . '"',
];
if ($email !== '') $headers[] = 'Reply-To: ' . mb_encode_mimeheader($name, 'UTF-8') . " <$email>";

$body = "--$mixed\r\nContent-Type: multipart/alternative; boundary=\"$alt\"\r\n\r\n"
    . "--$alt\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($textBody)) . "\r\n"
    . "--$alt\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html)) . "\r\n"
    . "--$alt--\r\n";
foreach ($photos as $p) {
    $body .= "--$mixed\r\nContent-Type: {$p['type']}; name=\"{$p['name']}\"\r\nContent-Transfer-Encoding: base64\r\n"
        . "Content-Disposition: attachment; filename=\"{$p['name']}\"\r\n\r\n" . chunk_split(base64_encode($p['data'])) . "\r\n";
}
$body .= "--$mixed--\r\n";

$encodedSubject = mb_encode_mimeheader($subject, 'UTF-8');

// ---- send ------------------------------------------------------------------------
// transport "file" writes the email to outbox/ instead of sending (local testing)
if (($cfg['transport'] ?? 'mail') === 'file') {
    $dir = (string)($cfg['outbox_dir'] ?? __DIR__ . '/outbox');
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    $eml = "To: $to\r\nSubject: $encodedSubject\r\n" . implode("\r\n", $headers) . "\r\n\r\n" . $body;
    $ok = @file_put_contents("$dir/$id.eml", $eml) !== false;
    @file_put_contents("$dir/$id.html", $html);
} else {
    $ok = mail($to, $encodedSubject, $body, implode("\r\n", $headers), '-f' . $from);
}

// optional backup copy outside the web root, so a mail outage never loses a lead
if (!empty($cfg['backup_file'])) {
    $copy = ['id' => $id, 'at' => date('c', $now), 'service' => $service, 'name' => $name, 'phone' => $prettyPhone, 'zip' => $zip,
        'email' => $email, 'method' => $method, 'timing' => $timing, 'details' => $details, 'photos' => count($photos), 'mailed' => $ok];
    @file_put_contents((string)$cfg['backup_file'], json_encode($copy) . "\n", FILE_APPEND | LOCK_EX);
}

if (!$ok) respond(502, ['ok' => false, 'error' => 'mail_failed']);
respond(200, ['ok' => true, 'id' => $id]);
