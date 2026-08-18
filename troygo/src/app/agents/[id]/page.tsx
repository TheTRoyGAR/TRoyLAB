import { localAgents, travelGuides } from '@/lib/data/agents'
import AgentProfileClient from './AgentProfileClient'

export async function generateStaticParams() {
  const agentParams = localAgents.map((a) => ({ id: String(a.id) }))
  const guideParams = travelGuides.map((g) => ({ id: String(g.id + 1000) }))
  return [...agentParams, ...guideParams]
}

export default async function AgentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AgentProfileClient id={id} />
}
