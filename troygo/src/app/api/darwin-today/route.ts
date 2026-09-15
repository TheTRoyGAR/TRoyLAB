import { getDarwinToday } from '@/lib/darwin-today'

export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  const data = await getDarwinToday()
  return Response.json(data)
}
