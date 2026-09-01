import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'

const SECTIONS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Flights', href: '/flights' },
      { label: 'Hotels', href: '/hotels' },
      { label: 'Car Rentals', href: '/cars' },
      { label: 'Packages', href: '/packages' },
      { label: 'Cruises', href: '/cruises' },
      { label: 'Group Cruises', href: '/group-cruises' },
      { label: 'Trip Planner', href: '/trip-planner' },
      { label: 'Partners', href: '/partners' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
]

export default function SitemapPage() {
  return (
    <MainLayout>
      <div style={{ background: '#0A1628' }} className="text-white min-h-[70vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1
            className="text-3xl sm:text-4xl font-black mb-10"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFD700' }}
          >
            Sitemap
          </h1>
          <div className="grid sm:grid-cols-3 gap-10">
            {SECTIONS.map((section) => (
              <div key={section.heading}>
                <h2
                  className="text-sm font-bold uppercase tracking-widest mb-4"
                  style={{ color: '#00B4D8', letterSpacing: '0.12em' }}
                >
                  {section.heading}
                </h2>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-white/70 hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
