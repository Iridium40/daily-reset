import { NextRequest, NextResponse } from 'next/server'
import { getAppUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  const search = req.nextUrl.searchParams.get('search')

  if (id) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: { startsAt: 'desc' },
          include: {
            counselor: { select: { name: true } },
            sessionNote: { select: { id: true, content: true, createdAt: true } },
          },
        },
        hipaaIntake: { select: { completedAt: true } },
      },
    })
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    return NextResponse.json(client)
  }

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const clients = await prisma.client.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: 50,
    include: {
      _count: { select: { bookings: true } },
      hipaaIntake: { select: { completedAt: true } },
    },
  })

  return NextResponse.json(clients)
}
