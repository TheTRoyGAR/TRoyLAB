import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'

const FAQS = [
  {
    q: 'How does booking work?',
    a: 'Submitting a request through our site (flights, hotels, cars, packages, or cruises) is an enquiry. We confirm real availability and pricing with you directly, and send written confirmation before anything is finalised — nothing is auto-booked or charged.',
  },
  {
    q: 'Can I pay online?',
    a: 'Not yet — we don\'t have an online payment processor integrated at the moment. Payment is arranged directly with you as part of confirming a booking.',
  },
  {
    q: 'How do I change or cancel a booking?',
    a: 'Contact us directly at agency@troytravelagency.com or +61 422 781 807. Cancellation and change terms depend on the specific airline, hotel, or cruise line for your booking.',
  },
  {
    q: 'Do you offer group or custom trips?',
    a: 'Yes — see our Group Cruises and Trip Planner pages, or contact us directly to build a custom itinerary.',
  },
  {
    q: 'How can I become a travel partner?',
    a: 'Visit our Partners page to submit a partner application.',
  },
  {
    q: 'What if I don\'t get a reply?',
    a: 'We aim to respond to every enquiry promptly. If you haven\'t heard back, please follow up by phone at +61 422 781 807.',
  },
]

export default function HelpCenterPage() {
  return (
    <MainLayout>
      <div style={{ background: '#0A1628' }} className="text-white min-h-[70vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1
            className="text-3xl sm:text-4xl font-black mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFD700' }}
          >
            Help Center
          </h1>
          <p className="text-white/60 mb-10">
            Answers to common questions. Can't find what you need?{' '}
            <Link href="/contact" className="underline" style={{ color: '#00B4D8' }}>
              Contact us directly
            </Link>.
          </p>

          <div className="space-y-6">
            {FAQS.map((item) => (
              <div key={item.q} className="bg-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-2">{item.q}</h2>
                <p className="text-white/70 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
