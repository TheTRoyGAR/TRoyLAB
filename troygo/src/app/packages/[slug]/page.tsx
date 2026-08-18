import { notFound } from 'next/navigation'
import { travelPackages } from '@/lib/data/packages'
import PackageDetailClient from './PackageDetailClient'

export async function generateStaticParams() {
  return travelPackages.map((pkg) => ({ slug: pkg.slug }))
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pkg = travelPackages.find((p) => p.slug === slug)
  if (!pkg) notFound()
  return <PackageDetailClient pkg={pkg!} />
}
