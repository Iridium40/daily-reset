import { NextRequest, NextResponse } from 'next/server'
import { getAppUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

const DAYS = [0, 1, 2, 3, 4, 5, 6]
const TIME_RE = /^\d{2}:\d{2}$/

type SlotInput = { dayOfWeek: number; startTime: string; endTime: string }

function validateSlot(s: SlotInput): string | null {
  if (!DAYS.includes(s.dayOfWeek)) return `Invalid day: ${s.dayOfWeek}`
  if (!TIME_RE.test(s.startTime)) return `Invalid startTime: ${s.startTime}`
  if (!TIME_RE.test(s.endTime)) return `Invalid endTime: ${s.endTime}`
  if (s.startTime >= s.endTime) return `startTime must be before endTime`
  return null
}

export async function PUT(req: NextRequest) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { counselorId, slots } = body as { counselorId: string; slots: SlotInput[] }
  if (!counselorId) return NextResponse.json({ error: 'counselorId required' }, { status: 400 })
  if (!Array.isArray(slots)) return NextResponse.json({ error: 'slots must be an array' }, { status: 400 })

  for (const s of slots) {
    const err = validateSlot(s)
    if (err) return NextResponse.json({ error: err }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.counselorAvailability.deleteMany({ where: { counselorId } }),
    ...slots.map(s =>
      prisma.counselorAvailability.create({
        data: { counselorId, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime },
      }),
    ),
  ])

  const updated = await prisma.counselorAvailability.findMany({
    where: { counselorId },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  })
  return NextResponse.json(updated)
}
