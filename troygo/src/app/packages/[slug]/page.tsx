import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { travelPackages } from '@/lib/data/packages'
import PackageDetailClient from './PackageDetailClient'

export async function generateStaticParams() {
  return travelPackages.map((pkg) => ({ slug: pkg.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const pkg = travelPackages.find((p) => p.slug === slug)
  if (!pkg) return {}

  const title = pkg.name
  const description = pkg.description.length > 155 ? `${pkg.description.slice(0, 152)}...` : pkg.description
  const url = `https://troytravelagency.com/packages/${pkg.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pkg = travelPackages.find((p) => p.slug === slug)
  if (!pkg) notFound()
  return <PackageDetailClient pkg={pkg!} />
}
