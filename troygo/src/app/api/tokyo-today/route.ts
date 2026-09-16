import { getTokyoToday } from '@/lib/tokyo-today'

export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  const data = await getTokyoToday()
  return Response.json(data)
}
