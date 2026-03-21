import { NextRequest, NextResponse } from 'next/server'
import { getAppUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const status = req.nextUrl.searchParams.get('status')
  const counselorId = req.nextUrl.searchParams.get('counselorId')
  const search = req.nextUrl.searchParams.get('search')

  const where: any = {}
  if (status && status !== 'all') where.status = status
  if (counselorId) where.counselorId = counselorId
  if (search) {
    where.client = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { startsAt: 'desc' },
    take: 100,
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      counselor: { select: { id: true, name: true } },
      sessionNote: { select: { id: true } },
    },
  })

  return NextResponse.json(bookings)
}

export async function PATCH(req: NextRequest) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, status } = body
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })

  const booking = await prisma.booking.update({
    where: { id },
    data: { status },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      counselor: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(booking)
}
