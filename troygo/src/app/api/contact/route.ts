import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { isValidEmail, clip, formRateLimited } from '@/lib/form-guard'

/* ─── POST /api/contact ─────────────────────────────────────────────────────
 * Real Contact Us form handler: saves the sender as a real contact (lead
 * source), and sends a real notification email to the agency inbox plus a
 * real confirmation email to the sender.
 */
export async function POST(req: NextRequest) {
  try {
    await ensureSchema()
    const body = await req.json() as { name: string; email: string; message: string }

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { success: false, error: 'name, email, and message are required.' },
        { status: 400 }
      )
    }
    if (!isValidEmail(body.email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 })
    }
    body.name = clip(body.name, 80)
    body.email = body.email.trim()
    body.message = clip(body.message, 2000)
    if (!body.name || !body.message) {
      return NextResponse.json({ success: false, error: 'name and message are required.' }, { status: 400 })
    }
    if (await formRateLimited()) {
      return NextResponse.json({ success: false, error: 'Too many messages right now. Please try again later.' }, { status: 429 })
    }

    const [firstName, ...rest] = body.name.trim().split(' ')
    const lastName = rest.join(' ') || '-'

    await sql`
      INSERT INTO contacts (first_name, last_name, email, source, notes)
      VALUES (${firstName}, ${lastName}, ${body.email}, 'contact_form', ${body.message})
      ON CONFLICT (email) DO UPDATE SET notes = EXCLUDED.notes
    `

    const notify = await sendEmail({
      to: 'agency@troytravelagency.com',
      subject: `New contact form message from ${body.name}`,
      text: `From: ${body.name} <${body.email}>\n\n${body.message}`,
    })

    const confirm = await sendEmail({
      to: body.email,
      subject: 'We received your message — TRoy Travel Agency™',
      text: `Hi ${firstName},\n\nThanks for reaching out to TRoy Travel Agency™ (TRoyGO™). We've received your message and will get back to you as soon as we can.\n\nIf you did not send this, you can ignore this email.\n\n- TRoyGO™`,
    })

    return NextResponse.json({
      success: true,
      notified: notify.sent,
      confirmed: confirm.sent,
    })
  } catch (error) {
    console.error('[TRoyGO™] Contact form error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 })
  }
}
