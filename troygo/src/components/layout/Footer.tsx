'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plane,
  Hotel,
  Car,
  Package,
  Ship,
  Map,
  Mail,
  Send,
  MapPin,
  Phone,
  ChevronRight,
  Globe,
} from 'lucide-react'

/* ─── Social icon SVGs (not available in lucide-react v1) ─────────────────── */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.023 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.096 24 18.1 24 12.073z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}
import toast from 'react-hot-toast'

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

/* ─── Pinterest icon (not in lucide-react) ──────────────────────────────── */
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  )
}

/* ─── Footer link lists ─────────────────────────────────────────────────── */
const COMPANY_LINKS = [
  { label: 'About Us',    href: '/about'   },
  { label: 'Our Team',    href: '/team'    },
  { label: 'Careers',     href: '/careers' },
  { label: 'Press',       href: '/press'   },
  { label: 'Blog',        href: '/blog'    },
]

const SERVICE_LINKS = [
  { label: 'Flights',      href: '/flights',       icon: Plane   },
  { label: 'Hotels',       href: '/hotels',        icon: Hotel   },
  { label: 'Car Rentals',  href: '/cars',          icon: Car     },
  { label: 'Packages',     href: '/packages',      icon: Package },
  { label: 'Cruises',      href: '/cruises',       icon: Ship    },
  { label: 'Trip Planner', href: '/trip-planner',  icon: Map     },
]

const SUPPORT_LINKS = [
  { label: 'Help Center',       href: '/help'          },
  { label: 'Contact Us',        href: '/contact'       },
  { label: 'Terms of Service',  href: '/terms'         },
  { label: 'Privacy Policy',    href: '/privacy'       },
]

const LEGAL_LINKS = [
  { label: 'Terms & Conditions', href: '/terms'   },
  { label: 'Privacy Policy',     href: '/privacy' },
  { label: 'Cookie Policy',      href: '/cookies' },
  { label: 'Sitemap',            href: '/sitemap' },
]

/* ─── Social links ──────────────────────────────────────────────────────── */
const SOCIAL_LINKS = [
  {
    label:   'Follow TRoy Travel Agency™ on Facebook',
    href:    '#',
    Icon:    FacebookIcon,
    color:   '#1877F2',
  },
  {
    label:   'Follow TRoy Travel Agency™ on Instagram',
    href:    '#',
    Icon:    InstagramIcon,
    color:   '#E1306C',
  },
  {
    label:   'Follow TRoy Travel Agency™ on Pinterest',
    href:    '#',
    Icon:    PinterestIcon,
    color:   '#E60023',
  },
  {
    label:   'Follow TRoy Travel Agency™ on LinkedIn',
    href:    '#',
    Icon:    LinkedinIcon,
    color:   '#0A66C2',
  },
  {
    label:   'Subscribe to TRoyGO™ on YouTube',
    href:    'https://www.youtube.com/@TRoyGOtm',
    Icon:    YoutubeIcon,
    color:   '#FF0000',
  },
]

/* ─── Section heading ─────────────────────────────────────────────────── */
function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-sm font-bold uppercase tracking-widest mb-5"
      style={{ color: '#00B4D8', letterSpacing: '0.12em' }}
    >
      {children}
    </h3>
  )
}

/* ─── Footer link item ────────────────────────────────────────────────── */
function FooterLink({
  href,
  children,
  built = true,
  onUnbuilt,
}: {
  href: string
  children: React.ReactNode
  built?: boolean
  onUnbuilt?: () => void
}) {
  const arrow = (
    <ChevronRight
      className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0"
      style={{ color: '#00B4D8' }}
    />
  )

  if (!built) {
    return (
      <li>
        <button
          type="button"
          onClick={onUnbuilt}
          className="group flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors py-0.5 text-left w-full"
        >
          {arrow}
          {children}
        </button>
      </li>
    )
  }

  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors py-0.5"
      >
        {arrow}
        {children}
      </Link>
    </li>
  )
}

/* ─── Footer component ──────────────────────────────────────────────────── */
export default function Footer() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null)

  function handleNewsletter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    /* Simulate subscription – replace with real API call */
    setTimeout(() => {
      toast.success(`You're subscribed! Welcome aboard, traveller.`)
      setEmail('')
      setSubmitting(false)
    }, 800)
  }

  return (
    <footer
      className="text-white"
      style={{ background: '#0A1628' }}
      aria-label="TRoyGO™ site footer"
    >
      {/* ── Newsletter banner ──────────────────────────────────────────────── */}
      <div
        className="border-b"
        style={{
          background: 'linear-gradient(135deg, #102444 0%, #0096B5 100%)',
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Never miss a deal
              </h2>
              <p className="text-white/70 text-sm">
                Get exclusive travel offers, tips, and inspiration straight to your inbox.
              </p>
            </div>
            <form
              onSubmit={handleNewsletter}
              className="flex w-full md:w-auto gap-0 max-w-md"
              aria-label="Newsletter signup"
            >
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 min-w-0 px-4 py-3 text-sm bg-white/10 border border-white/20 rounded-l-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/15 focus:border-white/40 transition-colors"
                disabled={submitting}
                aria-label="Your email address"
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-r-xl shrink-0 transition-all hover:brightness-110 disabled:opacity-60"
                style={{ background: '#FFD700', color: '#0A1628' }}
                aria-label="Subscribe to newsletter"
              >
                <Send className="h-4 w-4" />
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Main footer grid ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Brand column — spans 2 cols on lg */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <Link href="/" aria-label="TRoyGO™ — home" className="inline-block group mb-5">
              <div className="flex flex-col leading-none">
                <span
                  className="text-3xl font-black tracking-tight group-hover:opacity-90 transition-opacity"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    color: '#FFD700',
                    letterSpacing: '-0.02em',
                  }}
                >
                  TRoyGO™
                </span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest mt-0.5"
                  style={{ color: '#00B4D8', letterSpacing: '0.18em' }}
                >
                  TRoy Travel Agency™
                </span>
              </div>
            </Link>

            {/* Tagline */}
            <p
              className="text-lg font-medium mb-4 italic"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#FFD700',
              }}
            >
              "Your World, Your Journey"
            </p>
            <p className="text-sm text-white/55 leading-relaxed max-w-sm mb-6">
              TRoy Travel Agency™ is your premium partner for curated travel experiences
              around the globe. From quick getaways to multi-continent adventures, we make
              every journey unforgettable.
            </p>

            {/* Contact info */}
            <ul className="space-y-2 mb-7 text-sm text-white/55">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0" style={{ color: '#00B4D8' }} />
                <a
                  href="mailto:agency@troytravelagency.com"
                  className="hover:text-white transition-colors"
                  aria-label="Email TRoy Travel Agency™"
                >
                  agency@troytravelagency.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0" style={{ color: '#00B4D8' }} />
                <span>+1 (800) TROY-GO1</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#00B4D8' }} />
                <span>123 Global Plaza, Suite 800, New York, NY 10001</span>
              </li>
            </ul>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (href === '#') {
                      e.preventDefault()
                      setNoticeMessage(`${label.replace('Follow ', '').replace('Subscribe to ', '')} isn't connected yet.`)
                    }
                  }}
                  className="flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background = `${color}22`
                    ;(e.currentTarget as HTMLAnchorElement).style.color = color
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'
                    ;(e.currentTarget as HTMLAnchorElement).style.color = ''
                  }}
                >
                  <Icon className="h-4 w-4 text-white/60 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <FooterHeading>Company</FooterHeading>
            <ul className="space-y-1">
              {COMPANY_LINKS.map((link) => (
                <FooterLink
                  key={link.href}
                  href={link.href}
                  built={false}
                  onUnbuilt={() => setNoticeMessage(`${link.label} page isn't built yet.`)}
                >
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <FooterHeading>Services</FooterHeading>
            <ul className="space-y-1">
              {SERVICE_LINKS.map((link) => {
                const Icon = link.icon
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-sm text-white/55 hover:text-white transition-colors py-0.5"
                    >
                      <Icon
                        className="h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                        style={{ color: '#00B4D8' }}
                      />
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Support + Legal stacked */}
          <div className="space-y-8">
            <div>
              <FooterHeading>Support</FooterHeading>
              <ul className="space-y-1">
                {SUPPORT_LINKS.map((link) => (
                  <FooterLink
                    key={link.href + link.label}
                    href={link.href}
                    built={false}
                    onUnbuilt={() => setNoticeMessage(`${link.label} page isn't built yet.`)}
                  >
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </div>
            <div>
              <FooterHeading>Legal</FooterHeading>
              <ul className="space-y-1">
                {LEGAL_LINKS.map((link) => (
                  <FooterLink
                    key={link.href + link.label}
                    href={link.href}
                    built={false}
                    onUnbuilt={() => setNoticeMessage(`${link.label} page isn't built yet.`)}
                  >
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
      <div
        className="border-t"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
            <p>
              © 2025{' '}
              <span className="text-white/60 font-medium">TRoy Travel Agency™</span>
              . All rights reserved. ABN 30 302 098 137
            </p>
            <p className="flex items-center gap-1.5">
              <Globe className="h-3 w-3" style={{ color: '#00B4D8' }} />
              <span style={{ color: '#FFD700' }} className="font-semibold">TRoyGO™</span>
              {' '}is a registered trademark of TRoy Travel Agency™
            </p>
          </div>
        </div>
      </div>

      {/* Lightweight notice for not-yet-built pages/links */}
      {noticeMessage && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <p className="text-sm text-gray-600 mb-5">{noticeMessage}</p>
            <button
              onClick={() => setNoticeMessage(null)}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: '#0A1628' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </footer>
  )
}
