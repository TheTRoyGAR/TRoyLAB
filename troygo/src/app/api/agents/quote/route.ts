import { NextRequest, NextResponse } from 'next/server'
import { sql, ensureSchema } from '@/lib/db'
import { sendEmail } from '@/lib/email'

/* ─── POST /api/agents/quote ─────────────────────────────────────────────
 * Real "Request a Quote" handler for an agent/travel guide profile page.
 * Saves the requester as a real contact, sends a real notification email
 * to the agency inbox with the quote details, and a real confirmation
 * email back to the requester. No simulated/local-only success state.
 */
export async function POST(req: NextRequest) {
  try {
    await ensureSchema()
    const body = await req.json() as {
      name: string
      email: string
      expertName: string
      destination: string
      dates?: string
      travelers?: string
      message: string
    }

    if (!body.name || !body.email || !body.expertName || !body.destination || !body.message) {
      return NextResponse.json(
        { success: false, error: 'name, email, expertName, destination, and message are required.' },
        { status: 400 }
      )
    }

    const [firstName, ...rest] = body.name.trim().split(' ')
    const lastName = rest.join(' ') || '-'

    const notes = `Quote request for ${body.expertName} — destination: ${body.destination}` +
      (body.dates ? `, dates: ${body.dates}` : '') +
      (body.travelers ? `, travelers: ${body.travelers}` : '') +
      `\n\n${body.message}`

    await sql`
      INSERT INTO contacts (first_name, last_name, email, source, notes)
      VALUES (${firstName}, ${lastName}, ${body.email}, 'agent_quote_request', ${notes})
      ON CONFLICT (email) DO UPDATE SET notes = EXCLUDED.notes
    `

    const notify = await sendEmail({
      to: 'agency@troytravelagency.com',
      subject: `New quote request for ${body.expertName} — ${body.destination}`,
      text: `From: ${body.name} <${body.email}>\nRequested expert: ${body.expertName}\nDestination: ${body.destination}\n` +
        (body.dates ? `Travel dates: ${body.dates}\n` : '') +
        (body.travelers ? `Travelers: ${body.travelers}\n` : '') +
        `\nMessage:\n${body.message}`,
    })

    const confirm = await sendEmail({
      to: body.email,
      subject: 'We received your quote request — TRoy Travel Agency™',
      text: `Hi ${firstName},\n\nThanks for your quote request regarding ${body.expertName} for ${body.destination}. TRoyGO™'s team has received it and will get back to you as soon as we can.\n\nYour message:\n${body.message}\n\n- TRoyGO™`,
    })

    return NextResponse.json({
      success: true,
      notified: notify.sent,
      confirmed: confirm.sent,
    })
  } catch (error) {
    console.error('[TRoyGO™] Agent quote request error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send quote request.' }, { status: 500 })
  }
}
