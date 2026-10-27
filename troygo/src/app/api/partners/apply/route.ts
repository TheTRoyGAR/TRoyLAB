import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { sql, ensureSchema, getSetting } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { verifyTurnstile } from '@/lib/turnstile'
import {
  cleanApplication,
  looksLikePdf,
  looksLikeText,
  registrationInfo,
  safeDocName,
  isUuid,
  PARTNER_STATUSES,
  type PartnerStatus,
} from '@/lib/partner-guard'

const MAX_FILE_BYTES = 4.5 * 1024 * 1024 // @vercel/blob server-upload cap
const ALLOWED_EXTENSIONS = ['.pdf', '.md']
const MAX_PER_HOUR = 10 // whole site
const MAX_PER_EMAIL_PER_DAY = 3

/* ─── POST /api/partners/apply ─────────────────────────────────────────────
 * Public application form. Nothing is published: an application is only a
 * request that the owner reviews in the admin Partners screen.
 * Protected by the Turnstile captcha (when configured), validation, a file
 * check (extension AND real content), and rate limits.
 */
export async function POST(req: NextRequest) {
  try {
    await ensureSchema()

    let form: FormData
    try {
      form = await req.formData()
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    if (!(await verifyTurnstile(form.get('turnstile'), ip))) {
      return NextResponse.json(
        { success: false, error: 'Please complete the security check and try again.' },
        { status: 403 }
      )
    }

    const fields: Record<string, unknown> = {}
    for (const key of ['organisation', 'name', 'email', 'country', 'website', 'registrationNumber', 'specialization', 'destinationsCovered', 'credentials', 'message', 'consent']) {
      const v = form.get(key)
      fields[key] = typeof v === 'string' ? v : ''
    }
    const cleaned = cleanApplication(fields)
    if (!cleaned.ok) {
      return NextResponse.json({ success: false, error: cleaned.error }, { status: 400 })
    }
    const a = cleaned.value

    const hourly = await sql`SELECT COUNT(*)::int AS n FROM partner_submissions WHERE created_at > now() - interval '1 hour'`
    if (Number(hourly[0]?.n ?? 0) >= MAX_PER_HOUR) {
      return NextResponse.json(
        { success: false, error: 'We are receiving a lot of applications right now. Please try again later.' },
        { status: 429 }
      )
    }
    const perEmail = await sql`SELECT COUNT(*)::int AS n FROM partner_submissions WHERE lower(email) = lower(${a.email}) AND created_at > now() - interval '24 hours'`
    if (Number(perEmail[0]?.n ?? 0) >= MAX_PER_EMAIL_PER_DAY) {
      return NextResponse.json(
        { success: false, error: 'We already have your application. We will be in touch after we have reviewed it.' },
        { status: 429 }
      )
    }

    const file = form.get('document')
    let documentUrl: string | null = null
    let documentName: string | null = null
    if (file && typeof file !== 'string' && file.size > 0) {
      const lowerName = file.name.toLowerCase()
      const ext = ALLOWED_EXTENSIONS.find((e) => lowerName.endsWith(e))
      if (!ext) {
        return NextResponse.json({ success: false, error: 'Package document must be a PDF or MD file.' }, { status: 400 })
      }
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json({ success: false, error: 'Package document must be under 4.5MB.' }, { status: 400 })
      }
      const bytes = new Uint8Array(await file.arrayBuffer())
      const genuine = ext === '.pdf' ? looksLikePdf(bytes) : looksLikeText(bytes)
      if (!genuine) {
        return NextResponse.json({ success: false, error: 'That file does not look like a real PDF or MD document.' }, { status: 400 })
      }
      const name = safeDocName(file.name)
      // Private: submissions are pending review, not part of the public site yet.
      const blob = await put(`partner-submissions/${Date.now()}-${name}`, new Blob([bytes], { type: ext === '.pdf' ? 'application/pdf' : 'text/markdown' }), {
        access: 'private',
        addRandomSuffix: true,
      })
      documentUrl = blob.url
      documentName = name
    }

    const rows = await sql`
      INSERT INTO partner_submissions (
        organisation, name, email, country, website, registration_number,
        specialization, destinations_covered, credentials, message,
        document_url, document_name
      ) VALUES (
        ${a.organisation}, ${a.name}, ${a.email}, ${a.country}, ${a.website}, ${a.registrationNumber},
        ${a.specialization}, ${a.destinationsCovered}, ${a.credentials}, ${a.message},
        ${documentUrl}, ${documentName}
      )
      RETURNING id, created_at
    `

    // Tell the owner (the old code only wrote a log line, so nobody knew an application had arrived).
    const reg = registrationInfo(a.country, a.registrationNumber)
    const owner = await sendEmail({
      to: await getSetting('notification_email'),
      subject: `New partner application: ${a.organisation} (${a.country})`,
      text: [
        'A new partner application was received.',
        '',
        `Organisation: ${a.organisation}`,
        `Country: ${a.country}`,
        `Contact: ${a.name} <${a.email}>`,
        `Website: ${a.website ?? 'not given'}`,
        `Registration number: ${a.registrationNumber ?? 'not given'}${reg.kind === 'abn' ? (reg.checksumOk ? ' (ABN format valid, check it on the ABR)' : ' (ABN format INVALID)') : ''}`,
        `Specialises in: ${a.specialization}`,
        `Destinations: ${a.destinationsCovered}`,
        `Document attached: ${documentName ? 'yes' : 'no'}`,
        '',
        'Review it in the admin portal, under Partners.',
        '',
        '— TRoyGO™',
      ].join('\n'),
    })
    if (!owner.sent) console.error('[TRoyGO™ Partners] Owner notification FAILED:', owner.error)

    const ack = await sendEmail({
      to: a.email,
      subject: 'We received your TRoyGO™ partner application',
      text: [
        `Hi ${a.name.split(' ')[0]},`,
        'Thank you for applying to partner with TRoyGO™. We have received your application and we review every one by hand. This is not an automatic listing and nothing is confirmed yet. We will contact you after we have reviewed it.',
        'If you did not send this application, you can ignore this email.',
        '— TRoyGO™',
      ].join('\n\n'),
    })
    if (!ack.sent) console.error('[TRoyGO™ Partners] Applicant acknowledgement FAILED:', ack.error)

    return NextResponse.json(
      {
        success: true,
        id: rows[0].id,
        status: 'pending_review',
        message: 'Application received. TRoyGO™ will review your submission and be in touch.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[TRoyGO™ Partners] Application error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    )
  }
}

/* ─── GET /api/partners/apply (admin only: locked by the middleware) ───────── */
export async function GET() {
  try {
    await ensureSchema()
    const rows = await sql`
      SELECT id, organisation, name, email, country, website, registration_number,
             specialization, destinations_covered, credentials, message,
             document_name, (document_url IS NOT NULL) AS has_document,
             status, reviewer_notes, created_at, reviewed_at
      FROM partner_submissions
      ORDER BY created_at DESC
      LIMIT 500
    `
    const submissions = rows.map((r) => ({
      ...r,
      registration: registrationInfo(r.country as string | null, r.registration_number as string | null),
    }))
    return NextResponse.json({ success: true, submissions })
  } catch (error) {
    console.error('[TRoyGO™ Partners] Submission list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load submissions.' }, { status: 500 })
  }
}

/* ─── PATCH /api/partners/apply (admin only): set the review status + notes ── */
export async function PATCH(req: NextRequest) {
  try {
    await ensureSchema()
    const body = (await req.json().catch(() => null)) as { id?: unknown; status?: unknown; reviewerNotes?: unknown } | null
    if (!body || !isUuid(body.id)) {
      return NextResponse.json({ success: false, error: 'A valid application id is required.' }, { status: 400 })
    }
    if (typeof body.status !== 'string' || !(PARTNER_STATUSES as readonly string[]).includes(body.status)) {
      return NextResponse.json({ success: false, error: 'Unknown status.' }, { status: 400 })
    }
    const status = body.status as PartnerStatus
    const notes = typeof body.reviewerNotes === 'string' ? body.reviewerNotes.trim().slice(0, 2000) : null
    const rows = await sql`
      UPDATE partner_submissions
      SET status = ${status},
          reviewer_notes = ${notes},
          reviewed_at = ${status === 'pending_review' ? null : new Date().toISOString()}
      WHERE id = ${body.id}
      RETURNING id, status, reviewer_notes, reviewed_at
    `
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 })
    }
    return NextResponse.json({ success: true, submission: rows[0] })
  } catch (error) {
    console.error('[TRoyGO™ Partners] Review update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update the application.' }, { status: 500 })
  }
}
