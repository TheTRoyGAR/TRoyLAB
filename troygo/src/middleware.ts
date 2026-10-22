import { NextRequest, NextResponse } from 'next/server'

const ADMIN_HOST = 'dashboard.troytravelagency.com'
// Admin-only API routes (owner password required on every host). A method list
// means only those methods are locked; the others stay public because the
// public site uses them (booking creation, the contact/quote/newsletter forms,
// partner applications). Everything not listed here is public by design.
const ADMIN_ONLY_API: Record<string, string[] | '*'> = {
  '/api/contacts': '*',
  '/api/leads': '*',
  '/api/emails': '*',
  '/api/settings': '*',
  '/api/bookings': '*',
  '/api/bookings/confirm': '*',
  '/api/bookings/create': ['GET', 'DELETE'], // POST = the public booking form
  '/api/agents/trigger': '*',
  '/api/newsletter': ['GET'], // POST = public signup
  '/api/partners/apply': ['GET'], // POST = public application
}

function isAdminOnlyApi(pathname: string, method: string): boolean {
  const rule = ADMIN_ONLY_API[pathname.replace(/\/+$/, '')]
  if (!rule) return false
  return rule === '*' || rule.includes(method.toUpperCase())
}

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

  const isProtectedApi = isAdminOnlyApi(pathname, req.method)

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
