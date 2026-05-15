import { notFound } from 'next/navigation'
import { travelPackages } from '@/lib/data/packages'
import PackageDetailClient from './PackageDetailClient'

export async function generateStaticParams() {
  return travelPackages.map((pkg) => ({ slug: pkg.slug }))
}

export default function PackageDetailPage({ params }: { params: { slug: string } }) {
  const pkg = travelPackages.find((p) => p.slug === params.slug)
  if (!pkg) notFound()
  return <PackageDetailClient pkg={pkg!} />
}
