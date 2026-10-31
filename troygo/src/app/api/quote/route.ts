import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { isValidEmail, clip, formRateLimited } from '@/lib/form-guard'
import { verifyTurnstile } from '@/lib/turnstile'

/* ─── POST /api/quote ────────────────────────────────────────────────────
 * Public "Request a Quote" for items without an online price (cruises,
 * packages, hotels, cars, anything else). Same protections as the contact
 * form: captcha, validation, length limits, hourly cap. The request is saved
 * as a contact note (a repeat requester's earlier notes are kept, not
 * overwritten) and emailed to the agency; the visitor gets a confirmation
 * that never repeats their own text.
 */
const KINDS = new Set(['cruise', 'package', 'hotel', 'car', 'flight', 'other'])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>

    const kind = typeof body.kind === 'string' && KINDS.has(body.kind) ? body.kind : 'other'
    const name = clip(body.name, 80)
    const email = clip(body.email, 254)
    const phone = clip(body.phone, 40)
    const itemName = clip(body.itemName, 160)
    const dates = clip(body.dates, 120)
    const travelers = clip(body.travelers, 60)
    const message = clip(body.message, 2000)

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Please enter your name and email address.' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 })
    }
    if (!itemName) {
      return NextResponse.json({ success: false, error: 'Please say what you would like a quote for.' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    if (!(await verifyTurnstile(typeof body.turnstile === 'string' ? body.turnstile : undefined, ip))) {
      return NextResponse.json({ success: false, error: 'Please complete the security check and try again.' }, { status: 403 })
    }
    await ensureSchema()
    if (await formRateLimited()) {
      return NextResponse.json({ success: false, error: 'Too many requests right now. Please try again later.' }, { status: 429 })
    }

    const [firstName, ...rest] = name.split(' ')
    const lastName = rest.join(' ') || '-'
    const stamp = new Date().toISOString().slice(0, 10)
    const note =
      `[${stamp}] Quote request (${kind}): ${itemName}` +
      (dates ? `\nDates: ${dates}` : '') +
      (travelers ? `\nTravellers: ${travelers}` : '') +
      (message ? `\nMessage: ${message}` : '')

    await sql`
      INSERT INTO contacts (first_name, last_name, email, phone, source, notes)
      VALUES (${firstName}, ${lastName}, ${email}, ${phone || null}, 'quote_request', ${note})
      ON CONFLICT (email) DO UPDATE SET
        notes = RIGHT(COALESCE(contacts.notes, '') || E'\n\n' || EXCLUDED.notes, 8000),
        phone = COALESCE(contacts.phone, EXCLUDED.phone)
    `

    const notify = await sendEmail({
      to: 'agency@troytravelagency.com',
      subject: `Quote request (${kind}): ${itemName}`,
      text:
        `From: ${name} <${email}>${phone ? `\nPhone: ${phone}` : ''}\nType: ${kind}\nFor: ${itemName}\n` +
        (dates ? `Dates: ${dates}\n` : '') +
        (travelers ? `Travellers: ${travelers}\n` : '') +
        (message ? `\nMessage:\n${message}\n` : ''),
    })

    // The confirmation deliberately does not echo anything the visitor typed.
    const confirm = await sendEmail({
      to: email,
      subject: 'We received your quote request - TRoyGO',
      text:
        `Hi ${firstName},\n\nThanks for your quote request. TRoyGO has received it and will reply with a confirmed price and availability.\n\n` +
        `If you did not send this, you can ignore this email.\n\nTRoyGO`,
    })

    return NextResponse.json({ success: true, notified: notify.sent, confirmed: confirm.sent })
  } catch (error) {
    console.error('[TRoyGO] Quote request error:', error)
    return NextResponse.json({ success: false, error: 'We could not send your request. Please try again.' }, { status: 500 })
  }
}
