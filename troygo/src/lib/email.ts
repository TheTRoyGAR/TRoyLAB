// Real Gmail send via agency@troytravelagency.com - reuses the same OAuth2
// consent already granted for that account (see
// TRoyAI/.gmail_token_agency_troytravelagency.json / gmail_tool.py in the
// Python backend, which reads/drafts/labels via this same account today).
//
// Uses the Gmail REST API directly, NOT SMTP/nodemailer. Verified by hand
// (2026-08-31): nodemailer's SMTP XOAUTH2 mechanism rejects this account's
// gmail.modify-scoped token with "535 Username and Password not accepted",
// even with a freshly-minted access token — the Gmail REST API accepts the
// exact same token immediately (200, real message ID). SMTP XOAUTH2 appears
// to need a broader scope (e.g. https://mail.google.com/) than gmail.modify
// grants; re-consenting to widen the scope was avoidable by using the API
// this account already works with, so that's what this does.
//
// Required env vars (Vercel project settings, Production + Preview):
//   GMAIL_SENDER_ADDRESS   - agency@troytravelagency.com
//   GMAIL_OAUTH_CLIENT_ID
//   GMAIL_OAUTH_CLIENT_SECRET
//   GMAIL_OAUTH_REFRESH_TOKEN
// If any are missing, sendEmail() returns {sent: false} with a clear error
// instead of silently no-op'ing - callers must handle the failure
// explicitly, never swallow it and report success anyway.

async function getAccessToken(): Promise<string> {
  const { GMAIL_OAUTH_CLIENT_ID, GMAIL_OAUTH_CLIENT_SECRET, GMAIL_OAUTH_REFRESH_TOKEN } = process.env

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GMAIL_OAUTH_CLIENT_ID!,
      client_secret: GMAIL_OAUTH_CLIENT_SECRET!,
      refresh_token: GMAIL_OAUTH_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })

  if (!resp.ok) {
    throw new Error(`Failed to refresh Gmail access token: ${resp.status} ${await resp.text()}`)
  }
  const data = await resp.json() as { access_token: string }
  return data.access_token
}

function buildRawMessage(opts: { from: string; to: string; subject: string; text: string }): string {
  const message = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    opts.text,
  ].join('\r\n')

  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export interface SendEmailResult {
  sent: boolean
  error?: string
}

/**
 * Sends a real email via the Gmail REST API. Never throws to the caller for
 * a delivery failure - returns {sent: false, error} instead, so a route can
 * decide how to react (e.g. still return 201 for the booking write, but be
 * honest in the response that the notification failed) rather than crashing
 * the whole request over an email problem.
 */
export async function sendEmail(opts: { to: string; subject: string; text: string }): Promise<SendEmailResult> {
  const sender = process.env.GMAIL_SENDER_ADDRESS
  const { GMAIL_OAUTH_CLIENT_ID, GMAIL_OAUTH_CLIENT_SECRET, GMAIL_OAUTH_REFRESH_TOKEN } = process.env

  if (!sender || !GMAIL_OAUTH_CLIENT_ID || !GMAIL_OAUTH_CLIENT_SECRET || !GMAIL_OAUTH_REFRESH_TOKEN) {
    const error = 'Email not configured: missing one or more of GMAIL_SENDER_ADDRESS, ' +
      'GMAIL_OAUTH_CLIENT_ID, GMAIL_OAUTH_CLIENT_SECRET, GMAIL_OAUTH_REFRESH_TOKEN.'
    console.error('[TRoyGO email]', error)
    return { sent: false, error }
  }

  try {
    const accessToken = await getAccessToken()
    const raw = buildRawMessage({ from: sender, to: opts.to, subject: opts.subject, text: opts.text })

    const resp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    })

    if (!resp.ok) {
      const body = await resp.text()
      throw new Error(`Gmail API send failed: ${resp.status} ${body}`)
    }
    return { sent: true }
  } catch (err) {
    console.error('[TRoyGO email] Real send failed:', err)
    return { sent: false, error: err instanceof Error ? err.message : String(err) }
  }
}
