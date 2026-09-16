import { getBangkokToday } from '@/lib/bangkok-today'

export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  const data = await getBangkokToday()
  return Response.json(data)
}
