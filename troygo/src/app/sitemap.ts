import type { MetadataRoute } from 'next'
import { travelPackages } from '@/lib/data/packages'
import { localAgents, travelGuides } from '@/lib/data/agents'

const BASE_URL = 'https://troytravelagency.com'

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/flights', priority: 0.9, changeFrequency: 'daily' },
  { path: '/hotels', priority: 0.9, changeFrequency: 'daily' },
  { path: '/cars', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/packages', priority: 0.9, changeFrequency: 'daily' },
  { path: '/cruises', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/group-cruises', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/trip-planner', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/travel-guide', priority: 0.9, changeFrequency: 'daily' },
  { path: '/agents', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/partners', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/help', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/careers', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/story', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/team', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/booking', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/cookies', priority: 0.2, changeFrequency: 'yearly' },
]

const TRAVEL_GUIDE_CITIES = ['darwin', 'istanbul', 'tokyo', 'bangkok', 'sydney']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const guideEntries: MetadataRoute.Sitemap = TRAVEL_GUIDE_CITIES.map((city) => ({
    url: `${BASE_URL}/travel-guide/${city}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }))

  const packageEntries: MetadataRoute.Sitemap = travelPackages.map((pkg) => ({
    url: `${BASE_URL}/packages/${pkg.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const agentEntries: MetadataRoute.Sitemap = localAgents.map((agent) => ({
    url: `${BASE_URL}/agents/${agent.id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  const guideProfileEntries: MetadataRoute.Sitemap = travelGuides.map((guide) => ({
    url: `${BASE_URL}/agents/${guide.id + 1000}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticEntries, ...guideEntries, ...packageEntries, ...agentEntries, ...guideProfileEntries]
}
