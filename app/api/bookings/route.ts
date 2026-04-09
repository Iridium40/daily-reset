import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { counselorId, startsAt, type, name, email, phone, donationAmountCents } = body

  if (!counselorId || !startsAt || !name?.trim() || !email?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'counselorId, startsAt, name, email, and phone are required' }, { status: 400 })
  }

  const bookingType = type === 'VIRTUAL' ? 'VIRTUAL' : 'IN_PERSON'
  const startDate = new Date(startsAt)
  const now = new Date()

  if (startDate <= now) {
    return NextResponse.json({ error: 'Booking must be in the future' }, { status: 400 })
  }

  const isNewClient = !(await prisma.client.findUnique({ where: { email: email.trim().toLowerCase() } }))
  if (isNewClient) {
    const minTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    if (startDate < minTime) {
      return NextResponse.json({ error: 'New clients must book at least 24 hours in advance' }, { status: 400 })
    }
    if (bookingType === 'VIRTUAL') {
      return NextResponse.json({ error: 'New clients must book in-person sessions' }, { status: 400 })
    }
  }

  const donation = Math.max(1000, Math.round(Number(donationAmountCents) || 1000))

  const counselor = await prisma.counselor.findUnique({ where: { id: counselorId, active: true } })
  if (!counselor) {
    return NextResponse.json({ error: 'Counselor not found or inactive' }, { status: 404 })
  }

  const conflict = await prisma.booking.findFirst({
    where: {
      counselorId,
      startsAt: startDate,
      status: { not: 'CANCELLED' },
    },
  })
  if (conflict) {
    return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 409 })
  }

  const client = await prisma.client.upsert({
    where: { email: email.trim().toLowerCase() },
    create: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
    },
    update: {
      name: name.trim(),
      phone: phone.trim(),
    },
  })

  const booking = await prisma.booking.create({
    data: {
      clientId: client.id,
      counselorId,
      startsAt: startDate,
      type: bookingType,
      status: 'CONFIRMED',
      donationAmountCents: donation,
    },
    include: {
      counselor: { select: { name: true, email: true, zoomLink: true } },
      client: { select: { name: true, email: true } },
    },
  })

  let hipaaToken: string | null = null
  if (isNewClient) {
    const intake = await prisma.hipaaIntake.create({
      data: { clientId: client.id },
    })
    hipaaToken = intake.token
  }

  return NextResponse.json({ ...booking, hipaaToken })
}

export async function GET(req: NextRequest) {
  const clientEmail = req.nextUrl.searchParams.get('clientEmail')

  if (clientEmail) {
    const client = await prisma.client.findUnique({
      where: { email: clientEmail.trim().toLowerCase() },
      include: {
        bookings: {
          orderBy: { startsAt: 'desc' },
          take: 1,
          include: { counselor: { select: { id: true, name: true } } },
        },
      },
    })
    if (!client) {
      return NextResponse.json({ found: false })
    }
    return NextResponse.json({
      found: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        lastCounselorId: client.bookings[0]?.counselor?.id ?? null,
        lastCounselorName: client.bookings[0]?.counselor?.name ?? null,
      },
    })
  }

  return NextResponse.json({ error: 'Provide clientEmail query param' }, { status: 400 })
}
