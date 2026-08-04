import { localAgents, travelGuides } from '@/lib/data/agents'
import AgentProfileClient from './AgentProfileClient'

export async function generateStaticParams() {
  const agentParams = localAgents.map((a) => ({ id: String(a.id) }))
  const guideParams = travelGuides.map((g) => ({ id: String(g.id + 1000) }))
  return [...agentParams, ...guideParams]
}

export default function AgentProfilePage({ params }: { params: { id: string } }) {
  return <AgentProfileClient id={params.id} />
}
