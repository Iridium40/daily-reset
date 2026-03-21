import { NextRequest, NextResponse } from 'next/server'
import { getAppUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const counselors = await prisma.counselor.findMany({
    orderBy: { name: 'asc' },
    include: { availability: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] } },
  })
  return NextResponse.json(counselors)
}

export async function POST(req: NextRequest) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, email, phone, zoomLink } = body
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  const existing = await prisma.counselor.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (existing) {
    return NextResponse.json({ error: 'A counselor with this email already exists' }, { status: 409 })
  }

  const counselor = await prisma.counselor.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      zoomLink: zoomLink?.trim() || null,
    },
    include: { availability: true },
  })
  return NextResponse.json(counselor)
}

export async function PATCH(req: NextRequest) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, name, email, phone, zoomLink, active } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (email) {
    const dup = await prisma.counselor.findFirst({
      where: { email: email.trim().toLowerCase(), NOT: { id } },
    })
    if (dup) return NextResponse.json({ error: 'Another counselor already uses this email' }, { status: 409 })
  }

  const counselor = await prisma.counselor.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(email !== undefined && { email: email.trim().toLowerCase() }),
      ...(phone !== undefined && { phone: phone?.trim() || null }),
      ...(zoomLink !== undefined && { zoomLink: zoomLink?.trim() || null }),
      ...(active !== undefined && { active }),
    },
    include: { availability: true },
  })
  return NextResponse.json(counselor)
}

export async function DELETE(req: NextRequest) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await prisma.counselor.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
