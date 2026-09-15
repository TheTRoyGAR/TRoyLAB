import { getIstanbulToday } from '@/lib/istanbul-today'

export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  const data = await getIstanbulToday()
  return Response.json(data)
}
