import { NextRequest, NextResponse } from 'next/server'

const ADMIN_HOST = 'dashboard.troytravelagency.com'
const PROTECTED_API_PATHS = new Set(['/api/partners/apply', '/api/bookings/confirm', '/api/settings', '/api/newsletter'])

// Protects the owner-only dashboard and internal admin APIs with real HTTP
// Basic Auth. ADMIN_USERNAME/ADMIN_PASSWORD are real secrets set in Vercel
// project env vars — never committed to the repo.
//
// The dashboard is served only on dashboard.troytravelagency.com (its root
// path maps to /dashboard internally). Visiting /dashboard directly on the
// main public domain is blocked outright — it's not a real page there.
// Every other request (the public site, bookings, partner submissions) is
// untouched by this middleware.
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const isAdminHost = host === ADMIN_HOST || host.startsWith(`${ADMIN_HOST}:`)
  const { pathname } = req.nextUrl

  // Partner applications and newsletter signups (POST) must stay public —
  // only their admin listings (GET, used by the review dashboard) are locked down.
  const isPublicPost =
    (pathname === '/api/partners/apply' || pathname === '/api/newsletter') && req.method === 'POST'
  const isProtectedApi = PROTECTED_API_PATHS.has(pathname) && !isPublicPost

  // /dashboard doesn't exist on the public-facing domain at all.
  if (!isAdminHost && pathname.startsWith('/dashboard')) {
    return new NextResponse('Not found.', { status: 404 })
  }

  // Nothing else on this request needs protecting — let it through untouched.
  if (!isAdminHost && !isProtectedApi) {
    return NextResponse.next()
  }

  const user = process.env.ADMIN_USERNAME
  const pass = process.env.ADMIN_PASSWORD

  if (!user || !pass) {
    // Fail closed: if the secret isn't configured, block access rather than
    // silently leaving the admin area open to the public.
    return new NextResponse('Admin access not configured.', { status: 503 })
  }

  const authHeader = req.headers.get('authorization')
  let authorized = false

  if (authHeader?.startsWith('Basic ')) {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8')
    const separatorIndex = decoded.indexOf(':')
    const suppliedUser = decoded.slice(0, separatorIndex)
    const suppliedPass = decoded.slice(separatorIndex + 1)
    authorized = suppliedUser === user && suppliedPass === pass
  }

  if (!authorized) {
    return new NextResponse('Authentication required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="TRoyGO Admin"' },
    })
  }

  // On the admin subdomain, map its root (and every non-API path) into /dashboard/*.
  if (isAdminHost && !pathname.startsWith('/dashboard') && !pathname.startsWith('/api')) {
    const url = req.nextUrl.clone()
    url.pathname = `/dashboard${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
