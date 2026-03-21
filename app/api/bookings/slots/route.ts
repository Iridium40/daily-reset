import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const SLOT_MINUTES = 60

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export async function GET(req: NextRequest) {
  const counselorId = req.nextUrl.searchParams.get('counselorId')
  const isNew = req.nextUrl.searchParams.get('isNew') === 'true'
  const daysAhead = 14

  if (!counselorId) {
    return NextResponse.json({ error: 'counselorId required' }, { status: 400 })
  }

  const counselor = await prisma.counselor.findUnique({
    where: { id: counselorId, active: true },
    include: { availability: true },
  })
  if (!counselor) {
    return NextResponse.json({ error: 'Counselor not found' }, { status: 404 })
  }

  const now = new Date()
  const minBookingTime = isNew ? addDays(now, 1) : now

  const rangeStart = new Date(Math.max(now.getTime(), minBookingTime.getTime()))
  const rangeEnd = addDays(now, daysAhead)

  const existingBookings = await prisma.booking.findMany({
    where: {
      counselorId,
      status: { not: 'CANCELLED' },
      startsAt: { gte: rangeStart, lte: rangeEnd },
    },
    select: { startsAt: true },
  })
  const bookedTimes = new Set(existingBookings.map(b => b.startsAt.toISOString()))

  const slots: { date: string; time: string; iso: string }[] = []
  const availByDay = new Map<number, { startTime: string; endTime: string }[]>()
  for (const a of counselor.availability) {
    const list = availByDay.get(a.dayOfWeek) || []
    list.push({ startTime: a.startTime, endTime: a.endTime })
    availByDay.set(a.dayOfWeek, list)
  }

  for (let d = 0; d < daysAhead; d++) {
    const date = addDays(now, d)
    const dow = date.getDay()
    const windows = availByDay.get(dow)
    if (!windows) continue

    for (const win of windows) {
      const [sh, sm] = win.startTime.split(':').map(Number)
      const [eh, em] = win.endTime.split(':').map(Number)
      const startMin = sh * 60 + sm
      const endMin = eh * 60 + em

      for (let m = startMin; m + SLOT_MINUTES <= endMin; m += SLOT_MINUTES) {
        const slotDate = new Date(date)
        slotDate.setHours(Math.floor(m / 60), m % 60, 0, 0)

        if (slotDate <= minBookingTime) continue
        if (bookedTimes.has(slotDate.toISOString())) continue

        const hh = String(Math.floor(m / 60)).padStart(2, '0')
        const mm = String(m % 60).padStart(2, '0')
        slots.push({
          date: formatDate(slotDate),
          time: `${hh}:${mm}`,
          iso: slotDate.toISOString(),
        })
      }
    }
  }

  return NextResponse.json({ counselor: { id: counselor.id, name: counselor.name }, slots })
}
