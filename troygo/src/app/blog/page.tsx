import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'

export default function BlogPage() {
  return (
    <MainLayout>
      <div style={{ background: '#0A1628' }} className="text-white min-h-[50vh]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1
            className="text-3xl sm:text-4xl font-black mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFD700' }}
          >
            Blog
          </h1>
          <p className="text-white/70 leading-relaxed">
            Our blog is coming soon. In the meantime, browse real destination
            journeys on our{' '}
            <Link href="/packages" className="underline" style={{ color: '#00B4D8' }}>Packages</Link> page.
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
