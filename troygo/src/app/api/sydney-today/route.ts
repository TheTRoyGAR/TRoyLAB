import { getSydneyToday } from '@/lib/sydney-today'

export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  const data = await getSydneyToday()
  return Response.json(data)
}
