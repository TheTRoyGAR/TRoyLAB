import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { sql, ensureSchema } from '@/lib/db'

const MAX_FILE_BYTES = 4.5 * 1024 * 1024 // @vercel/blob server-upload cap
const ALLOWED_EXTENSIONS = ['.pdf', '.md']

export async function POST(req: NextRequest) {
  try {
    await ensureSchema()

    const form = await req.formData()

    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const specialization = String(form.get('specialization') ?? '').trim()
    const destinationsCovered = String(form.get('destinationsCovered') ?? '').trim()
    const credentials = String(form.get('credentials') ?? '').trim() || null
    const message = String(form.get('message') ?? '').trim() || null
    const file = form.get('document') as File | null

    if (!name || !email || !specialization || !destinationsCovered) {
      return NextResponse.json(
        { success: false, error: 'Name, email, specialization, and destinations covered are required.' },
        { status: 400 }
      )
    }

    let documentUrl: string | null = null
    let documentName: string | null = null

    if (file && file.size > 0) {
      const lowerName = file.name.toLowerCase()
      const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))

      if (!hasAllowedExtension) {
        return NextResponse.json(
          { success: false, error: 'Package document must be a PDF or MD file.' },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { success: false, error: 'Package document must be under 4.5MB.' },
          { status: 400 }
        )
      }

      // Private: submissions are pending review, not part of the public site yet.
      const blob = await put(`partner-submissions/${Date.now()}-${file.name}`, file, {
        access: 'private',
        addRandomSuffix: true,
      })
      documentUrl = blob.url
      documentName = file.name
    }

    const rows = await sql`
      INSERT INTO partner_submissions (
        name, email, specialization, destinations_covered, credentials, message,
        document_url, document_name
      ) VALUES (
        ${name}, ${email}, ${specialization}, ${destinationsCovered}, ${credentials}, ${message},
        ${documentUrl}, ${documentName}
      )
      RETURNING id, created_at
    `

    console.log(`[TRoyGO™ Partners] New partner application received from ${name} (${email}) — id ${rows[0].id}`)

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

// GET /api/partners/apply — list pending submissions (internal review use)
export async function GET() {
  try {
    await ensureSchema()
    const rows = await sql`
      SELECT id, name, email, specialization, destinations_covered, credentials, message,
             document_url, document_name, status, created_at
      FROM partner_submissions
      ORDER BY created_at DESC
    `
    return NextResponse.json({ success: true, submissions: rows })
  } catch (error) {
    console.error('[TRoyGO™ Partners] Submission list error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load submissions.' }, { status: 500 })
  }
}
