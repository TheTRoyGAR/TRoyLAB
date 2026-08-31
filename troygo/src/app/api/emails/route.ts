import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/db'
import { sendEmail } from '@/lib/email'

/* ─── GET /api/emails ─────────────────────────────────────────────────────
 * Real sent-email log from Postgres. Starts empty - no fabricated
 * "opened"/"clicked" engagement stats, since there's no real tracking.
 */
export async function GET() {
  try {
    await ensureSchema()
    const rows = await sql`SELECT * FROM sent_emails ORDER BY sent_at DESC LIMIT 100`
    return NextResponse.json({
      success: true,
      emails: rows.map((r) => ({
        id: r.id,
        to: r.to_email,
        subject: r.subject,
        status: r.status,
        error: r.error,
        sentAt: r.sent_at,
      })),
    })
  } catch (error) {
    console.error('[TRoyGO™] Email log error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load email history.' }, { status: 500 })
  }
}

/* ─── POST /api/emails ─────────────────────────────────────────────────────
 * Sends a real email via the same Gmail integration the booking flow uses,
 * and logs a real record of it - sent or failed, never fabricated.
 */
export async function POST(req: NextRequest) {
  try {
    await ensureSchema()
    const body = await req.json() as { to: string; subject: string; body: string }
    if (!body.to || !body.subject || !body.body) {
      return NextResponse.json(
        { success: false, error: 'to, subject, and body are required.' },
        { status: 400 }
      )
    }

    const result = await sendEmail({ to: body.to, subject: body.subject, text: body.body })

    await sql`
      INSERT INTO sent_emails (to_email, subject, body, status, error)
      VALUES (${body.to}, ${body.subject}, ${body.body}, ${result.sent ? 'sent' : 'failed'}, ${result.error ?? null})
    `

    if (!result.sent) {
      return NextResponse.json({ success: false, error: result.error ?? 'Failed to send email.' }, { status: 502 })
    }
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[TRoyGO™] Email send error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send email.' }, { status: 500 })
  }
}
