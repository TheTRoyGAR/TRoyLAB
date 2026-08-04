'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Plane,
  Hotel,
  Car,
  Package,
  Ship,
  Map,
  Users,
  Globe,
  ChevronDown,
  Menu,
  X,
  Compass,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Types ────────────────────────────────────────────────────────────────── */
interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  description: string
}

interface Language {
  code: string
  label: string
  flag: string
}

interface Currency {
  code: string
  symbol: string
  label: string
}

/* ─── Navigation config ──────────────────────────────────────────────────── */
const NAV_ITEMS: NavItem[] = [
  { label: 'Flights',     href: '/flights',       icon: Plane,  description: 'Search & book flights worldwide'     },
  { label: 'Hotels',      href: '/hotels',        icon: Hotel,  description: 'Millions of hotels & properties'     },
  { label: 'Cars',        href: '/cars',          icon: Car,    description: 'Car rentals at top destinations'     },
  { label: 'Packages',    href: '/packages',      icon: Package,description: 'All-inclusive vacation bundles'      },
  { label: 'Cruises',     href: '/cruises',       icon: Ship,   description: 'Sail the world in style'            },
  { label: 'Trips',       href: '/trip-planner',  icon: Map,    description: 'AI-powered trip planning'           },
  { label: 'Agents',      href: '/agents',        icon: Users,  description: 'Connect with travel experts'        },
]

const LANGUAGES: Language[] = [
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
  { code: 'zh', label: '中文',       flag: '🇨🇳' },
  { code: 'ja', label: '日本語',     flag: '🇯🇵' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
]

const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$',  label: 'US Dollar'       },
  { code: 'EUR', symbol: '€',  label: 'Euro'            },
  { code: 'GBP', symbol: '£',  label: 'British Pound'   },
  { code: 'JPY', symbol: '¥',  label: 'Japanese Yen'    },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar'},
  { code: 'AED', symbol: 'د.إ',label: 'UAE Dirham'      },
]

/* ─── Dropdown wrapper ─────────────────────────────────────────────────────── */
function Dropdown({
  trigger,
  children,
  align = 'left',
}: {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors focus:outline-none"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {trigger}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className={cn(
            'absolute top-full mt-2 z-50 min-w-[160px] rounded-xl overflow-hidden',
            'bg-navy-800 border border-white/10 shadow-2xl',
            'animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          style={{ background: '#0D1E35' }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

/* ─── Header component ─────────────────────────────────────────────────────── */
export default function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [activeLang, setActiveLang]   = useState<Language>(LANGUAGES[0])
  const [activeCurrency, setActiveCurrency] = useState<Currency>(CURRENCIES[0])

  /* Track scroll for blur/shadow effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-navy/95 backdrop-blur-md shadow-lg shadow-black/20'
            : 'bg-navy'
        )}
        style={{ background: scrolled ? 'rgba(10,22,40,0.96)' : '#0A1628' }}
      >
        {/* ── Top utility bar ──────────────────────────────────────────── */}
        <div
          className="hidden md:flex items-center justify-end gap-4 px-6 py-1.5 text-xs border-b"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          {/* Language picker */}
          <Dropdown
            align="right"
            trigger={
              <span className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition-colors">
                <Globe className="h-3 w-3" />
                {activeLang.flag} {activeLang.label}
              </span>
            }
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                role="option"
                aria-selected={activeLang.code === lang.code}
                onClick={() => setActiveLang(lang)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left',
                  activeLang.code === lang.code
                    ? 'text-teal-400 bg-white/5'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
                style={activeLang.code === lang.code ? { color: '#00C9F0' } : {}}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </Dropdown>

          <span className="w-px h-3 bg-white/20" />

          {/* Currency picker */}
          <Dropdown
            align="right"
            trigger={
              <span className="flex items-center gap-1 text-white/70 hover:text-white text-xs transition-colors">
                {activeCurrency.symbol} {activeCurrency.code}
              </span>
            }
          >
            {CURRENCIES.map((cur) => (
              <button
                key={cur.code}
                role="option"
                aria-selected={activeCurrency.code === cur.code}
                onClick={() => setActiveCurrency(cur)}
                className={cn(
                  'w-full flex items-center justify-between gap-4 px-4 py-2.5 text-sm transition-colors text-left',
                  activeCurrency.code === cur.code
                    ? 'text-teal-400 bg-white/5'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
                style={activeCurrency.code === cur.code ? { color: '#00C9F0' } : {}}
              >
                <span className="font-mono text-xs opacity-60 w-8">{cur.symbol}</span>
                <span className="flex-1">{cur.label}</span>
                <span className="font-semibold text-xs opacity-80">{cur.code}</span>
              </button>
            ))}
          </Dropdown>
        </div>

        {/* ── Main nav row ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 md:px-6 h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex flex-col leading-none group shrink-0"
            aria-label="TRoyGO™ — TRoy Travel Agency™ home"
          >
            <span
              className="text-2xl font-black tracking-tight transition-opacity group-hover:opacity-90"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#FFD700',
                letterSpacing: '-0.02em',
              }}
            >
              TRoyGO™
            </span>
            <span
              className="text-[9px] font-semibold uppercase tracking-widest transition-opacity group-hover:opacity-90"
              style={{ color: '#00B4D8', letterSpacing: '0.18em' }}
            >
              TRoy Travel Agency™
            </span>
          </Link>

          {/* Desktop nav tabs */}
          <nav className="hidden lg:flex items-center" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.description}
                  className={cn(
                    'relative flex items-center gap-1.5 px-3 py-5 text-sm font-medium',
                    'transition-colors duration-200 group whitespace-nowrap',
                    active ? 'text-white' : 'text-white/65 hover:text-white'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}

                  {/* Active / hover underline */}
                  <span
                    className={cn(
                      'absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200',
                      active
                        ? 'opacity-100 scale-x-100'
                        : 'opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-100'
                    )}
                    style={{ background: '#00B4D8' }}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Auth buttons (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className="px-4 py-2 text-sm font-semibold text-white/80 hover:text-white rounded-lg transition-colors hover:bg-white/10"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-4 py-2 text-sm font-bold rounded-lg transition-all hover:brightness-110 hover:-translate-y-px"
              style={{
                background: '#FFD700',
                color: '#0A1628',
              }}
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile: hamburger */}
          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile menu overlay ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-40 flex flex-col pt-[112px]"
          style={{ background: '#0A1628' }}
          aria-modal="true"
          role="dialog"
          aria-label="Mobile navigation menu"
        >
          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-4 py-2" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item, idx) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-4 px-4 py-4 rounded-xl mb-1 transition-all',
                    'animate-fade-in',
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/6'
                  )}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  aria-current={active ? 'page' : undefined}
                >
                  <span
                    className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                    style={{
                      background: active ? 'rgba(0,180,216,0.2)' : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: active ? '#00B4D8' : 'inherit' }}
                    />
                  </span>
                  <div>
                    <p className="font-semibold text-base">{item.label}</p>
                    <p className="text-xs opacity-60 mt-0.5">{item.description}</p>
                  </div>
                  {active && (
                    <span
                      className="ml-auto w-1.5 h-6 rounded-full shrink-0"
                      style={{ background: '#00B4D8' }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Mobile: language / currency row */}
          <div
            className="border-t px-4 py-4 flex items-center gap-3"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <Globe className="h-4 w-4 text-white/40 shrink-0" />
            <select
              defaultValue={activeLang.code}
              onChange={(e) => {
                const lang = LANGUAGES.find((l) => l.code === e.target.value)
                if (lang) setActiveLang(lang)
              }}
              className="flex-1 bg-transparent text-white/70 text-sm focus:outline-none"
              aria-label="Select language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} style={{ background: '#0A1628' }}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
            <span className="w-px h-4 bg-white/20" />
            <select
              defaultValue={activeCurrency.code}
              onChange={(e) => {
                const cur = CURRENCIES.find((c) => c.code === e.target.value)
                if (cur) setActiveCurrency(cur)
              }}
              className="bg-transparent text-white/70 text-sm focus:outline-none"
              aria-label="Select currency"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} style={{ background: '#0A1628' }}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile: auth buttons */}
          <div
            className="border-t px-4 py-4 flex gap-3"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <Link
              href="/auth/sign-in"
              className="flex-1 py-3 text-center text-sm font-semibold text-white/80 rounded-xl border transition-colors hover:text-white hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all"
              style={{ background: '#FFD700', color: '#0A1628' }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}

      {/* Spacer so content starts below fixed header */}
      <div className="h-16 md:h-[104px]" aria-hidden="true" />
    </>
  )
}
