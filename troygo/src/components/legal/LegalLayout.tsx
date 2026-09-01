import MainLayout from '@/components/layout/MainLayout'

export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <MainLayout>
      <div style={{ background: '#0A1628' }} className="text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1
            className="text-3xl sm:text-4xl font-black mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFD700' }}
          >
            {title}
          </h1>
          <p className="text-sm text-white/50 mb-10">Last updated: {updated}</p>
          <div className="prose prose-invert max-w-none space-y-6 text-white/80 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-2 [&_a]:text-[#00B4D8] [&_a]:hover:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:text-white/75">
            {children}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
