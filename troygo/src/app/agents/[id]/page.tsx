import type { Metadata } from 'next'
import { localAgents, travelGuides } from '@/lib/data/agents'
import AgentProfileClient from './AgentProfileClient'

export async function generateStaticParams() {
  const agentParams = localAgents.map((a) => ({ id: String(a.id) }))
  const guideParams = travelGuides.map((g) => ({ id: String(g.id + 1000) }))
  return [...agentParams, ...guideParams]
}

function findProfile(id: string) {
  const numericId = Number(id)
  if (numericId >= 1000) {
    return travelGuides.find((g) => g.id + 1000 === numericId)
  }
  return localAgents.find((a) => a.id === numericId)
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const profile = findProfile(id)
  if (!profile) return {}

  const title = `${profile.name} — ${profile.location.city}, ${profile.location.country} | ${profile.specialty.join(', ')}`
  const description = profile.bio.length > 155 ? `${profile.bio.slice(0, 152)}...` : profile.bio
  const url = `https://troytravelagency.com/agents/${id}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'profile' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function AgentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AgentProfileClient id={id} />
}
