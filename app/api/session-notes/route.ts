import { NextRequest, NextResponse } from 'next/server'
import { getAppUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bookingId = req.nextUrl.searchParams.get('bookingId')
  const clientId = req.nextUrl.searchParams.get('clientId')

  if (bookingId) {
    const note = await prisma.sessionNote.findUnique({
      where: { bookingId },
      include: { counselor: { select: { name: true } } },
    })
    return NextResponse.json(note)
  }

  if (clientId) {
    const notes = await prisma.sessionNote.findMany({
      where: { booking: { clientId } },
      orderBy: { createdAt: 'desc' },
      include: {
        counselor: { select: { name: true } },
        booking: { select: { startsAt: true, type: true } },
      },
    })
    return NextResponse.json(notes)
  }

  return NextResponse.json({ error: 'Provide bookingId or clientId' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { bookingId, counselorId, content, privateNotes } = body

  if (!bookingId || !counselorId || !content?.trim()) {
    return NextResponse.json({ error: 'bookingId, counselorId, and content are required' }, { status: 400 })
  }

  const existing = await prisma.sessionNote.findUnique({ where: { bookingId } })
  if (existing) {
    return NextResponse.json({ error: 'A note already exists for this booking. Use PATCH to update.' }, { status: 409 })
  }

  const note = await prisma.sessionNote.create({
    data: {
      bookingId,
      counselorId,
      content: content.trim(),
      privateNotes: privateNotes?.trim() || null,
    },
  })
  return NextResponse.json(note)
}

export async function PATCH(req: NextRequest) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, content, privateNotes } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const note = await prisma.sessionNote.update({
    where: { id },
    data: {
      ...(content !== undefined && { content: content.trim() }),
      ...(privateNotes !== undefined && { privateNotes: privateNotes?.trim() || null }),
    },
  })
  return NextResponse.json(note)
}
