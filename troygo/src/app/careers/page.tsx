import MainLayout from '@/components/layout/MainLayout'

export default function CareersPage() {
  return (
    <MainLayout>
      <div style={{ background: '#0A1628' }} className="text-white min-h-[50vh]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1
            className="text-3xl sm:text-4xl font-black mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FFD700' }}
          >
            Careers
          </h1>
          <p className="text-white/70 leading-relaxed">
            TRoyGO runs with a small, real human team backed by AI agents from our
            sister company, TRoyAI™ — rather than a large office of staff. We
            don&apos;t have open roles listed right now. If that changes, or if you
            think you&apos;d be a strong fit anyway, reach out at{' '}
            <a href="mailto:agency@troytravelagency.com" className="underline" style={{ color: '#00B4D8' }}>
              agency@troytravelagency.com
            </a>.
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
