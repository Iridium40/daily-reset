import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const intake = await prisma.hipaaIntake.findUnique({
    where: { token },
    include: { client: { select: { name: true, email: true } } },
  })
  if (!intake) return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })

  return NextResponse.json({
    id: intake.id,
    clientName: intake.client.name,
    completed: !!intake.completedAt,
    formData: intake.completedAt ? JSON.parse(intake.formData || '{}') : null,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { token, formData } = body
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const intake = await prisma.hipaaIntake.findUnique({ where: { token } })
  if (!intake) return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
  if (intake.completedAt) return NextResponse.json({ error: 'Form already submitted' }, { status: 400 })

  await prisma.hipaaIntake.update({
    where: { token },
    data: {
      formData: JSON.stringify(formData),
      completedAt: new Date(),
    },
  })

  return NextResponse.json({ ok: true })
}
